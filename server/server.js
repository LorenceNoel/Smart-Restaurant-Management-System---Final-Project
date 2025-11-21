import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB, getPool, sql } from './db.js';


dotenv.config({ path: "./DB_config/.env" });

// Create our Express app and set the port
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());                    
app.use(express.json());            


// Root route - just to check if our server is alive and running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Restaurant API is running',
    database: process.env.DB_DATABASE,
    timestamp: new Date().toISOString()
  });
});

// Test route to check if database connection is working
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as database_name');
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Setup admin user for development/testing only
app.post('/api/setup-admin', async (req, res) => {
  try {
    const pool = getPool();
    
    // Check if admin already exists
    const checkResult = await pool.request()
      .input('Email', sql.NVarChar, 'admin@example.com')
      .query('SELECT UserID FROM Users WHERE Email = @Email');
    
    if (checkResult.recordset.length > 0) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        data: { email: 'admin@example.com', role: 'admin' }
      });
    }
    
    // Create admin user
    const result = await pool.request()
      .input('Email', sql.NVarChar, 'admin@example.com')
      .input('Password', sql.NVarChar, 'admin123') 
      .input('FirstName', sql.NVarChar, 'Admin')
      .input('LastName', sql.NVarChar, 'User')
      .input('Phone', sql.NVarChar, '555-0000')
      .input('Role', sql.NVarChar, 'admin')
      .query(`
        INSERT INTO Users (Email, Password, FirstName, LastName, Phone, Role, CreatedAt)
        VALUES (@Email, @Password, @FirstName, @LastName, @Phone, @Role, GETDATE());
        SELECT SCOPE_IDENTITY() as UserID;
      `);
    
    console.log('✅ Admin user created successfully');
    
    res.json({
      success: true,
      message: 'Admin user created successfully',
      data: { 
        userId: result.recordset[0].UserID, 
        email: 'admin@example.com', 
        role: 'admin' 
      }
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AUTHENTICATION ROUTES 

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const pool = getPool();
    
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, password)
      .input('FirstName', sql.NVarChar, firstName)
      .input('LastName', sql.NVarChar, lastName)
      .input('Phone', sql.NVarChar, phone)
      .execute('sp_CreateUser');
    
    res.json({
      success: true,
      data: { userId: result.recordset[0].UserID, email, role: 'customer' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message.includes('Email already exists') ? 'Email already exists' : 'Registration failed'
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = getPool();
    
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, password)
      .execute('sp_AuthenticateUser');
    
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.json({
        success: true,
        data: {
          userId: user.UserID,
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName,
          role: user.Role
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// MENU SYSTEM 

// Get all menu items for customers (only shows available items)
app.get('/api/menu', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .execute('sp_GetMenuItemsByCategory');
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get ALL menu items (for admin - includes unavailable items)
app.get('/api/menu/admin', async (req, res) => {
  try {
    const pool = getPool();
    // Direct SQL query using the correct column names
    const result = await pool.request().query(`
      SELECT 
        m.MenuItemID,
        m.Name,
        m.Description,
        m.Price,
        m.Ingredients,
        m.IsAvailable,
        m.DietaryType,
        m.ImageURL,
        c.CategoryID,
        c.CategoryName
      FROM MenuItems m
      INNER JOIN Categories c ON m.CategoryID = c.CategoryID
      ORDER BY c.CategoryName, m.Name
    `);
    
    console.log('Admin menu query result:', result.recordset.length, 'items found');
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching admin menu:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all categories for menu creation
app.get('/api/categories', async (req, res) => {
  try {
    const pool = getPool();
    console.log('Fetching categories from database...');
    const result = await pool.request().query('SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName');
    console.log('Categories query result:', result.recordset);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // If Categories table doesn't exist, try to extract from existing menu items
    try {
      console.log('Categories table error, trying to get unique categories from menu items...');
      const menuResult = await pool.request().query(`
        SELECT DISTINCT c.CategoryID, c.CategoryName 
        FROM MenuItems m 
        INNER JOIN Categories c ON m.CategoryID = c.CategoryID 
        ORDER BY c.CategoryName
      `);
      console.log('Fallback categories from menu items:', menuResult.recordset);
      
      res.json({
        success: true,
        data: menuResult.recordset
      });
    } catch (fallbackError) {
      console.error('Fallback categories query also failed:', fallbackError);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Create new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, description, price, categoryId, ingredients, dietaryType, isAvailable } = req.body;
    
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, price, categoryId'
      });
    }
    
    const pool = getPool();
    
    const result = await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Description', sql.NVarChar, description)
      .input('Price', sql.Decimal(10, 2), parseFloat(price))
      .input('CategoryID', sql.Int, parseInt(categoryId))
      .input('Ingredients', sql.NVarChar, ingredients || null)
      .input('DietaryType', sql.NVarChar, dietaryType || null)
      .input('IsAvailable', sql.Bit, isAvailable !== false) // Default to true
      .query(`
        INSERT INTO MenuItems (Name, Description, Price, CategoryID, Ingredients, DietaryType, IsAvailable)
        VALUES (@Name, @Description, @Price, @CategoryID, @Ingredients, @DietaryType, @IsAvailable);
        SELECT SCOPE_IDENTITY() as MenuItemID;
      `);
    
    res.json({
      success: true,
      data: { menuItemId: result.recordset[0].MenuItemID }
    });
  } catch (error) {
    console.error('Menu item creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update complete menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, ingredients, dietaryType, isAvailable } = req.body;
    
    const pool = getPool();
    
    // Build dynamic update query based on provided fields
    const updates = [];
    const request = pool.request().input('MenuItemID', sql.Int, id);
    
    if (name !== undefined) {
      updates.push('Name = @Name');
      request.input('Name', sql.NVarChar, name);
    }
    if (description !== undefined) {
      updates.push('Description = @Description');
      request.input('Description', sql.NVarChar, description);
    }
    if (price !== undefined) {
      updates.push('Price = @Price');
      request.input('Price', sql.Decimal(10, 2), parseFloat(price));
    }
    if (categoryId !== undefined) {
      updates.push('CategoryID = @CategoryID');
      request.input('CategoryID', sql.Int, parseInt(categoryId));
    }
    if (ingredients !== undefined) {
      updates.push('Ingredients = @Ingredients');
      request.input('Ingredients', sql.NVarChar, ingredients);
    }
    if (dietaryType !== undefined) {
      updates.push('DietaryType = @DietaryType');
      request.input('DietaryType', sql.NVarChar, dietaryType);
    }
    if (isAvailable !== undefined) {
      updates.push('IsAvailable = @IsAvailable');
      request.input('IsAvailable', sql.Bit, isAvailable);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields provided for update'
      });
    }
    
    await request.query(`UPDATE MenuItems SET ${updates.join(', ')} WHERE MenuItemID = @MenuItemID`);
    
    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Menu update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    // Check if menu item exists and is not referenced in orders
    const checkResult = await pool.request()
      .input('MenuItemID', sql.Int, id)
      .query(`
        SELECT COUNT(*) as OrderCount 
        FROM OrderItems 
        WHERE MenuItemID = @MenuItemID
      `);
    
    if (checkResult.recordset[0].OrderCount > 0) {
      // If item has orders, just mark as unavailable instead of deleting
      await pool.request()
        .input('MenuItemID', sql.Int, id)
        .query('UPDATE MenuItems SET IsAvailable = 0 WHERE MenuItemID = @MenuItemID');
      
      return res.json({
        success: true,
        message: 'Menu item has existing orders and has been marked as unavailable instead of deleted'
      });
    }
    
    // Safe to delete if no orders reference it
    await pool.request()
      .input('MenuItemID', sql.Int, id)
      .query('DELETE FROM MenuItems WHERE MenuItemID = @MenuItemID');
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Menu deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ORDER SYSTEM - Customer Transaction Flow

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, customerName, customerEmail, customerPhone, orderType, deliveryAddress, items } = req.body;
    const pool = getPool();
    
    // Create order
    const orderResult = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('CustomerName', sql.NVarChar, customerName)
      .input('CustomerEmail', sql.NVarChar, customerEmail)
      .input('CustomerPhone', sql.NVarChar, customerPhone)
      .input('OrderType', sql.NVarChar, orderType)
      .input('DeliveryAddress', sql.NVarChar, deliveryAddress)
      .execute('sp_CreateOrder');
    
    const orderId = orderResult.recordset[0].OrderID;
    
    // Add items to order
    for (const item of items) {
      await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('MenuItemID', sql.Int, item.menuItemId)
        .input('Quantity', sql.Int, item.quantity)
        .execute('sp_AddOrderItem');
    }
    
    // Update MenuName column with the order items
    await pool.request()
      .input('OrderID', sql.Int, orderId)
      .query(`
        UPDATE Orders 
        SET MenuName = (
          SELECT STRING_AGG(
            CONCAT(m.Name, ' (', oi.Quantity, ')'), 
            ', '
          )
          FROM OrderItems oi
          INNER JOIN MenuItems m ON oi.MenuItemID = m.MenuItemID
          WHERE oi.OrderID = @OrderID
        )
        WHERE OrderID = @OrderID
      `);
    
    console.log('✅ Order created with ID:', orderId, 'and MenuName populated');
    
    res.json({
      success: true,
      data: { orderId }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        o.OrderID,
        COALESCE(
          u.FirstName + ' ' + u.LastName, 
          NULLIF(o.CustomerName, ''), 
          o.CustomerEmail,
          'Walk-in Customer'
        ) as CustomerName,
        o.OrderType,
        o.Status,
        o.TotalAmount,
        o.OrderDate,
        o.EstimatedTime,
        o.CustomerEmail,
        o.CustomerPhone,
        o.DeliveryAddress,
        COALESCE(o.MenuName, 'No items') as MenuName
      FROM Orders o
      LEFT JOIN Users u ON o.UserID = u.UserID
      ORDER BY o.OrderDate DESC
    `);
    
    console.log('Orders query result:', result.recordset);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order details (items in a specific order)
app.get('/api/orders/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    console.log('🔍 Fetching order details for OrderID:', id);
    
    // First check if order items exist for this order
    const checkResult = await pool.request()
      .input('OrderID', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM OrderItems WHERE OrderID = @OrderID');
    
    console.log('📊 OrderItems count for OrderID', id, ':', checkResult.recordset[0].count);
    
    // First, get OrderItems data directly 
    const orderItemsResult = await pool.request()
      .input('OrderID', sql.Int, id)
      .query(`
        SELECT 
          OrderItemID,
          MenuItemID,
          Quantity,
          Price,
          Subtotal
        FROM OrderItems 
        WHERE OrderID = @OrderID
        ORDER BY OrderItemID
      `);
    
    console.log('📋 Raw OrderItems data:', orderItemsResult.recordset);
    
    // Join with MenuItems to get item names and descriptions
    const result = await pool.request()
      .input('OrderID', sql.Int, id)
      .query(`
        SELECT 
          oi.OrderItemID,
          oi.MenuItemID,
          oi.Quantity,
          oi.Price as ItemPrice,
          oi.Subtotal as ItemTotal,
          COALESCE(m.Name, 'Menu Item #' + CAST(oi.MenuItemID AS VARCHAR)) as ItemName,
          COALESCE(m.Description, 'No description available') as ItemDescription
        FROM OrderItems oi
        LEFT JOIN MenuItems m ON oi.MenuItemID = m.MenuItemID
        WHERE oi.OrderID = @OrderID
        ORDER BY oi.OrderItemID
      `);
    
    console.log('📋 Order details query result for OrderID', id, ':', result.recordset);
    console.log('📋 Number of items found:', result.recordset.length);
    
    if (result.recordset.length === 0) {
      console.log('⚠️ No order items found for OrderID:', id);
    }
    
    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = getPool();
    
    console.log('Updating order status - OrderID:', id, 'New Status:', status);
    
    const result = await pool.request()
      .input('OrderID', sql.Int, id)
      .input('Status', sql.VarChar(50), status)
      .query(`
        UPDATE Orders 
        SET Status = @Status 
        WHERE OrderID = @OrderID
      `);
    
    if (result.rowsAffected[0] > 0) {
      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// RESERVATION SYSTEM 

// Get available time slots for a specific date and party size
app.get('/api/reservations/available-slots', async (req, res) => {
  try {
    const { date, guests } = req.query;
    
    if (!date || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Date and guests parameters are required'
      });
    }

    const pool = getPool();
    
    // Restaurant configuration
    const ALL_TIME_SLOTS = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
    ];
    
    // Restaurant is open 7 days a week (no closed days)
    const selectedDate = new Date(date);
    
    // Get existing reservations for the date
    const result = await pool.request()
      .input('ReservationDate', sql.Date, date)
      .query(`
        SELECT ReservationTime, SUM(NumberOfGuests) as TotalGuests
        FROM Reservations 
        WHERE ReservationDate = @ReservationDate 
        AND Status IN ('Pending', 'Approved')
        GROUP BY ReservationTime
      `);
    
    const bookedSlots = result.recordset.reduce((acc, row) => {
      const timeSlot = row.ReservationTime.substring(0, 5); 
      acc[timeSlot] = row.TotalGuests;
      return acc;
    }, {});
    
    // Filter available slots based on capacity (assuming 50 total seats)
    const RESTAURANT_CAPACITY = 50;
    const requestedGuests = parseInt(guests);
    
    const availableSlots = ALL_TIME_SLOTS.filter(slot => {
      const currentBookings = bookedSlots[slot] || 0;
      const availableSeats = RESTAURANT_CAPACITY - currentBookings;
      return availableSeats >= requestedGuests;
    });
    
    // If same day, filter out past time slots
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (isToday) {
      const currentTime = today.getHours() * 60 + today.getMinutes();
      const twoHoursFromNow = currentTime + 120; 
      
      const filteredSlots = availableSlots.filter(slot => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        return slotTime >= twoHoursFromNow;
      });
      
      return res.json({
        success: true,
        data: { availableSlots: filteredSlots }
      });
    }
    
    res.json({
      success: true,
      data: { availableSlots }
    });
    
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available time slots'
    });
  }
});

// Create new reservation  
app.post('/api/reservations', async (req, res) => {
  try {
    const { userId, customerName, customerEmail, customerPhone, reservationDate, reservationTime, numberOfGuests, specialRequests } = req.body;
    
    // Validate required fields
    if (!customerName || !customerEmail || !reservationDate || !reservationTime || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerName, customerEmail, reservationDate, reservationTime, numberOfGuests'
      });
    }
    
    // Format time properly for SQL Server
    let formattedTime = reservationTime;
    if (reservationTime && !reservationTime.includes(':')) {
      throw new Error('Invalid time format');
    }
    
    // Ensure proper time format and create a proper time object
    if (reservationTime) {
      const timeParts = reservationTime.split(':');
      if (timeParts.length === 2) {
        // Add seconds if only HH:MM provided
        formattedTime = reservationTime + ':00';
      }
      
      // Validate time format (HH:MM:SS)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!timeRegex.test(formattedTime)) {
        throw new Error('Invalid time format. Expected HH:MM:SS format.');
      }
    }
    
    const pool = getPool();
    
    console.log('Creating reservation with data:', {
      userId, customerName, customerEmail, customerPhone,
      reservationDate, reservationTime: formattedTime, numberOfGuests, specialRequests
    });

    // using direct SQL query instead of stored procedure 
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('CustomerName', sql.NVarChar, customerName)
      .input('CustomerEmail', sql.NVarChar, customerEmail)
      .input('CustomerPhone', sql.NVarChar, customerPhone)
      .input('ReservationDate', sql.Date, reservationDate)
      .input('ReservationTime', sql.VarChar, formattedTime) 
      .input('NumberOfGuests', sql.Int, numberOfGuests)
      .input('SpecialRequests', sql.NVarChar, specialRequests)
      .query(`
        INSERT INTO Reservations (UserID, CustomerName, CustomerEmail, CustomerPhone,
                                 ReservationDate, ReservationTime, NumberOfGuests, SpecialRequests, Status)
        VALUES (@UserID, @CustomerName, @CustomerEmail, @CustomerPhone,
                @ReservationDate, CAST(@ReservationTime AS TIME), @NumberOfGuests, @SpecialRequests, 'Pending');
        SELECT SCOPE_IDENTITY() as ReservationID;
      `);
    
    console.log('Stored procedure result:', result);
    
    if (result.recordset && result.recordset.length > 0) {
      res.json({
        success: true,
        data: { reservationId: result.recordset[0].ReservationID }
      });
    } else {
      throw new Error('No reservation ID returned from database');
    }
  } catch (error) {
    console.error('Reservation creation error:', error);
    console.error('Original time value:', req.body.reservationTime);
    console.error('Formatted time value:', formattedTime || 'undefined');
    
    let errorMessage = 'Failed to create reservation';
    if (error.message && error.message.includes('Invalid time')) {
      errorMessage = 'Invalid time format. Please use HH:MM format (e.g., 14:30)';
    } else if (error.message && error.message.includes('ReservationTime')) {
      errorMessage = 'Invalid time format provided';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Get all reservations  
app.get('/api/reservations', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        ReservationID,
        CustomerName,
        CustomerEmail,
        ReservationDate,
        ReservationTime,
        NumberOfGuests,
        Status,
        SpecialRequests
      FROM Reservations
      WHERE ReservationDate >= CAST(GETDATE() AS DATE)
      ORDER BY ReservationDate, ReservationTime
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update reservation status
app.put('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tableNumber } = req.body;
    const pool = getPool();
    
    await pool.request()
      .input('ReservationID', sql.Int, id)
      .input('Status', sql.NVarChar, status)
      .input('TableNumber', sql.Int, tableNumber)
      .execute('sp_UpdateReservationStatus');
    
    res.json({
      success: true,
      message: 'Reservation status updated'
    });
  } catch (error) {
    console.error('Reservation status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ANALYTICS SYSTEM 

// Get analytics data
app.get('/api/analytics', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().execute('sp_GetAnalytics');
    
    res.json({
      success: true,
      data: result.recordsets 
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI RECOMMENDATION SYSTEM 

// Restaurant AI knowledge base
const restaurantKnowledge = {
  hours: "We're open Monday-Sunday, 11:00 AM - 10:00 PM. Kitchen closes at 9:30 PM.",
  location: "We're located at 123 Main Street, Downtown. Free parking available!",
  delivery: "We offer delivery within 5 miles for $3.99. Estimated delivery time: 30-45 minutes.",
  pickup: "Pickup orders are ready in 15-20 minutes. Call us when you arrive!",
  reservations: "You can make reservations online or call us. We recommend booking 1-2 hours ahead.",
  specials: "Today's special: 20% off pasta dishes! Also try our chef's signature burger.",
  payment: "We accept all major credit cards, cash, and mobile payments (Apple Pay, Google Pay).",
  dietary: {
    vegetarian: "We have many vegetarian options including pasta, salads, and veggie burgers.",
    vegan: "Our vegan menu includes quinoa bowls, veggie wraps, and plant-based burgers.", 
    glutenfree: "Gluten-free options available: grilled chicken, fish, salads, and GF pasta.",
    keto: "Keto-friendly: grilled meats, salads without croutons, and low-carb vegetables."
  }
};

// AI intent patterns for understanding customer messages
const intentPatterns = {
  hours: /\b(hours?|open|close|time)\b/i,
  menu: /\b(menu|food|dish|eat|meal)\b/i,
  delivery: /\b(deliver|delivery|ship)\b/i,
  pickup: /\b(pickup|take.*out|collect)\b/i,
  reservation: /\b(reserv|book|table)\b/i,
  location: /\b(where|location|address|direction)\b/i,
  specials: /\b(special|deal|discount|offer|promotion)\b/i,
  payment: /\b(pay|payment|card|cash)\b/i,
  dietary: /\b(vegetarian|vegan|gluten.*free|keto|diet|allerg)\b/i,
  recommend: /\b(recommend|suggest|popular|best|favorite)\b/i,
  help: /\b(help|assist|support)\b/i,
  greeting: /\b(hi|hello|hey|good)\b/i
};

// AI chat endpoint - handles customer conversations
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Generate AI response using restaurant intelligence
    const aiResponse = await generateAIResponse(message, userId);
    
    // Log interaction for learning
    console.log('AI Chat:', {
      userId: userId || 'guest',
      userMessage: message,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'AI assistant temporarily unavailable'
    });
  }
});

// AI personalized recommendations endpoint
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { userId, dietaryPreferences } = req.body;
    const pool = getPool();
    
    // Get user's order history for personalization
    let orderHistory = [];
    if (userId) {
      const orderResult = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(`
          SELECT TOP 10 MenuName, TotalAmount, OrderDate 
          FROM Orders 
          WHERE UserID = @UserID 
          ORDER BY OrderDate DESC
        `);
      orderHistory = orderResult.recordset;
    }
    
    // Get current menu items with categories
    const menuResult = await pool.request().query(`
      SELECT 
        m.MenuItemID,
        m.Name,
        m.Description,
        m.Price,
        m.DietaryType,
        c.CategoryName
      FROM MenuItems m
      INNER JOIN Categories c ON m.CategoryID = c.CategoryID
      WHERE m.IsAvailable = 1
      ORDER BY c.CategoryName, m.Name
    `);
    
    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(
      orderHistory,
      menuResult.recordset,
      dietaryPreferences
    );
    
    res.json({
      success: true,
      data: {
        recommendations,
        personalized: orderHistory.length > 0,
        dietaryPreferences: dietaryPreferences || 'none'
      }
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Recommendation system temporarily unavailable'
    });
  }
});

// AI business insights for admin
app.get('/api/ai/insights', async (req, res) => {
  try {
    const pool = getPool();
    
    // Get recent order data for analysis
    const orderStats = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalOrders,
        AVG(TotalAmount) as AverageOrderValue,
        MAX(OrderDate) as LastOrderDate
      FROM Orders 
      WHERE OrderDate >= DATEADD(day, -7, GETDATE())
    `);
    
    // Get popular menu items
    const popularItems = await pool.request().query(`
      SELECT TOP 5 
        MenuName,
        COUNT(*) as OrderCount
      FROM Orders 
      WHERE OrderDate >= DATEADD(day, -30, GETDATE())
        AND MenuName IS NOT NULL
      GROUP BY MenuName
      ORDER BY COUNT(*) DESC
    `);
    
    // Generate AI business insights
    const insights = generateBusinessInsights(orderStats.recordset[0], popularItems.recordset);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      error: 'AI insights temporarily unavailable'
    });
  }
});

// AI helper function - generates intelligent responses
async function generateAIResponse(userMessage, userId = null) {
  const message = userMessage.toLowerCase();
  
  // Greeting detection
  if (intentPatterns.greeting.test(message)) {
    return "Hello! Welcome to our restaurant! 🍽️ I'm here to help you with menu recommendations, reservations, or any questions you have. What can I assist you with?";
  }
  
  // Help detection
  if (intentPatterns.help.test(message)) {
    return "I can help you with:\n🍕 Menu recommendations\n📅 Reservations\n🚚 Delivery & pickup info\n⏰ Hours & location\n🎯 Daily specials\n🥗 Dietary preferences\n\nJust ask me anything!";
  }
  
  // Hours inquiry
  if (intentPatterns.hours.test(message)) {
    return `⏰ ${restaurantKnowledge.hours}`;
  }
  
  // Location inquiry
  if (intentPatterns.location.test(message)) {
    return `📍 ${restaurantKnowledge.location}`;
  }
  
  // Delivery inquiry
  if (intentPatterns.delivery.test(message)) {
    return `🚚 ${restaurantKnowledge.delivery}`;
  }
  
  // Pickup inquiry
  if (intentPatterns.pickup.test(message)) {
    return `🏪 ${restaurantKnowledge.pickup}`;
  }
  
  // Reservations inquiry
  if (intentPatterns.reservation.test(message)) {
    return `📅 ${restaurantKnowledge.reservations}`;
  }
  
  // Specials inquiry
  if (intentPatterns.specials.test(message)) {
    return `🎯 ${restaurantKnowledge.specials}`;
  }
  
  // Payment inquiry
  if (intentPatterns.payment.test(message)) {
    return `💳 ${restaurantKnowledge.payment}`;
  }
  
  // Dietary preferences
  if (intentPatterns.dietary.test(message)) {
    if (message.includes('vegetarian')) return `🥗 ${restaurantKnowledge.dietary.vegetarian}`;
    if (message.includes('vegan')) return `🌱 ${restaurantKnowledge.dietary.vegan}`;
    if (message.includes('gluten')) return `🌾 ${restaurantKnowledge.dietary.glutenfree}`;
    if (message.includes('keto')) return `🥩 ${restaurantKnowledge.dietary.keto}`;
    return "We cater to various dietary needs! Ask me about vegetarian, vegan, gluten-free, or keto options.";
  }
  
  // Menu recommendations - enhanced with real data
  if (intentPatterns.recommend.test(message) || intentPatterns.menu.test(message)) {
    try {
      const pool = getPool();
      const menuResult = await pool.request().query(`
        SELECT TOP 3 
          m.Name, 
          m.Price, 
          c.CategoryName 
        FROM MenuItems m
        INNER JOIN Categories c ON m.CategoryID = c.CategoryID
        WHERE m.IsAvailable = 1
        ORDER BY NEWID()
      `);
      
      if (menuResult.recordset.length > 0) {
        const recommendations = menuResult.recordset;
        return `🍽️ Here are some great options from our menu:\n\n${recommendations.map((item, index) => 
          `${index + 1}. ${item.Name} - $${item.Price} (${item.CategoryName})`
        ).join('\n')}\n\nWould you like more details about any of these, or do you have specific dietary preferences?`;
      }
    } catch (error) {
      console.log('Database menu fetch failed, using fallback');
    }
    
    // Fallback to static recommendations
    return "🍽️ I'd recommend our popular dishes:\n• Margherita Pizza - $14.99\n• Grilled Salmon - $18.99\n• Classic Burger - $13.99\n\nWould you like more details about any of these?";
  }
  
  // Default response
  return "I'd be happy to help! I can tell you about our menu, hours, delivery options, reservations, or daily specials. What would you like to know? 🤔";
}

// Generate personalized recommendations based on order history
function generatePersonalizedRecommendations(orderHistory, menuItems, dietaryPreferences) {
  let recommendations = [...menuItems];
  
  // Filter by dietary preferences if specified
  if (dietaryPreferences) {
    recommendations = recommendations.filter(item => {
      if (!item.DietaryType) return false;
      return item.DietaryType.toLowerCase().includes(dietaryPreferences.toLowerCase());
    });
  }
  
  // If user has order history, prioritize similar items
  if (orderHistory.length > 0) {
    const orderedItems = orderHistory.map(order => order.MenuName || '').join(' ').toLowerCase();
    
    // Boost score for items in similar categories or with similar names
    recommendations = recommendations.map(item => {
      let score = 0;
      
      // Check if user has ordered similar items
      if (orderedItems.includes(item.Name.toLowerCase())) {
        score += 10;
      }
      if (orderedItems.includes(item.CategoryName.toLowerCase())) {
        score += 5;
      }
      
      return { ...item, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  
  // Return top 5 recommendations with reasons
  return recommendations.slice(0, 5).map(item => ({
    name: item.Name,
    description: item.Description,
    price: item.Price,
    category: item.CategoryName,
    dietaryType: item.DietaryType || 'Standard',
    reason: getRecommendationReason(item, orderHistory, dietaryPreferences)
  }));
}

// Generate reason for recommendation
function getRecommendationReason(item, orderHistory, dietaryPreferences) {
  if (orderHistory.length > 0) {
    return `Based on your previous orders, you might enjoy this ${item.CategoryName}`;
  } else if (dietaryPreferences) {
    return `Perfect for your ${dietaryPreferences} dietary preference`;
  } else {
    return `Popular choice among customers`;
  }
}

// Generate business insights for admin
function generateBusinessInsights(orderStats, popularItems) {
  const insights = [];
  
  if (orderStats.TotalOrders > 50) {
    insights.push("🔥 High order volume this week! Consider preparing extra ingredients for popular items.");
  } else if (orderStats.TotalOrders < 20) {
    insights.push("📈 Order volume is lower than usual. Consider running a promotion to boost sales.");
  }
  
  if (orderStats.AverageOrderValue > 25) {
    insights.push("💰 Great average order value! Customers are choosing premium items.");
  } else {
    insights.push("🎯 Consider upselling appetizers or desserts to increase order value.");
  }
  
  return {
    summary: "AI analysis of recent business performance",
    weeklyStats: {
      totalOrders: orderStats.TotalOrders || 0,
      averageOrderValue: parseFloat(orderStats.AverageOrderValue || 0).toFixed(2),
      lastOrderDate: orderStats.LastOrderDate
    },
    popularItems: popularItems.map(item => ({
      name: item.MenuName,
      orders: item.OrderCount
    })),
    insights: insights,
    recommendations: [
      "Monitor peak hours for staff scheduling",
      "Track popular items for inventory management", 
      "Engage customers with personalized recommendations"
    ]
  };
}

// SERVER STARTUP & SHUTDOWN

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Database: ${process.env.DB_DATABASE}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await closeDB();
  process.exit(0);
});

startServer();