// This is our main server file - it's like the heart of our restaurant's backend!
// It handles all the API requests from the frontend and talks to the database.
// Think of it as the waiter that takes orders from customers and brings back food.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB, getPool, sql } from './db.js';

// Load our secret environment variables (database passwords, etc.)
dotenv.config({ path: "./DB_config/.env" });

// Create our Express app and set the port
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - these run before every request
app.use(cors());                    // Lets our frontend talk to the backend
app.use(express.json());            // Understands JSON data from requests

// =============================================================================
// BASIC ROUTES - For testing if everything works
// =============================================================================

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

// =============================================================================
// MENU ROUTES - Everything related to menu items
// =============================================================================

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
    // Direct SQL query using the correct column names (no ItemName column)
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

// Get orders
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
    
    // First, get OrderItems data directly (without JOIN to debug)
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
    
    // Now try to get menu item details with LEFT JOIN to see what happens
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

// Debug endpoint to check database structure
app.get('/api/debug/tables', async (req, res) => {
  try {
    const pool = getPool();
    
    // Check if OrderItems table exists and get its data
    const orderItemsResult = await pool.request().query(`
      SELECT COUNT(*) as count FROM OrderItems
    `);
    
    // Check if MenuItems table exists and get sample data
    const menuItemsResult = await pool.request().query(`
      SELECT TOP 5 MenuItemID, Name, Price FROM MenuItems
    `);
    
    res.json({
      success: true,
      data: {
        orderItemsCount: orderItemsResult.recordset[0].count,
        sampleMenuItems: menuItemsResult.recordset
      }
    });
  } catch (error) {
    console.error('Error checking database structure:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to check MenuItems data
app.get('/api/debug/menu-items', async (req, res) => {
  try {
    const pool = getPool();
    
    const result = await pool.request().query(`
      SELECT MenuItemID, Name, Description, Price, IsAvailable 
      FROM MenuItems 
      ORDER BY MenuItemID
    `);
    
    console.log('🍽️ All MenuItems:', result.recordset);
    
    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create sample order items (for testing)
app.post('/api/debug/create-sample-items', async (req, res) => {
  try {
    const pool = getPool();
    
    // First, let's check if we have any MenuItems
    const menuItems = await pool.request().query(`
      SELECT TOP 5 MenuItemID, Name, Price FROM MenuItems WHERE IsAvailable = 1
    `);
    
    if (menuItems.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No menu items found. Please add menu items first.'
      });
    }
    
    // Create sample order items for the first few orders
    const orders = await pool.request().query(`
      SELECT TOP 3 OrderID FROM Orders ORDER BY OrderDate DESC
    `);
    
    if (orders.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No orders found.'
      });
    }
    
    // Clear existing order items first
    await pool.request().query('DELETE FROM OrderItems');
    
    // Add sample items for each order
    for (let i = 0; i < orders.recordset.length; i++) {
      const order = orders.recordset[i];
      const menuItem1 = menuItems.recordset[i % menuItems.recordset.length];
      const menuItem2 = menuItems.recordset[(i + 1) % menuItems.recordset.length];
      
      // Add 2 items per order
      await pool.request()
        .input('OrderID', sql.Int, order.OrderID)
        .input('MenuItemID1', sql.Int, menuItem1.MenuItemID)
        .input('Quantity1', sql.Int, Math.floor(Math.random() * 3) + 1)
        .input('Price1', sql.Decimal(10, 2), menuItem1.Price)
        .input('MenuItemID2', sql.Int, menuItem2.MenuItemID)
        .input('Quantity2', sql.Int, Math.floor(Math.random() * 2) + 1)
        .input('Price2', sql.Decimal(10, 2), menuItem2.Price)
        .query(`
          INSERT INTO OrderItems (OrderID, MenuItemID, Quantity, Price) VALUES
          (@OrderID, @MenuItemID1, @Quantity1, @Price1),
          (@OrderID, @MenuItemID2, @Quantity2, @Price2)
        `);
    }
    
    res.json({
      success: true,
      message: 'Sample order items created successfully',
      data: {
        ordersProcessed: orders.recordset.length,
        menuItemsUsed: menuItems.recordset.length
      }
    });
  } catch (error) {
    console.error('Error creating sample items:', error);
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

// Get reservations
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

// ===== AUTHENTICATION ROUTES =====

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

// ===== ORDER MANAGEMENT ROUTES =====

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

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedTime } = req.body;
    const pool = getPool();
    
    await pool.request()
      .input('OrderID', sql.Int, id)
      .input('Status', sql.NVarChar, status)
      .input('EstimatedTime', sql.Int, estimatedTime)
      .execute('sp_UpdateOrderStatus');
    
    res.json({
      success: true,
      message: 'Order status updated'
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== RESERVATION ROUTES =====

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

    // Try using direct SQL query instead of stored procedure to debug
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('CustomerName', sql.NVarChar, customerName)
      .input('CustomerEmail', sql.NVarChar, customerEmail)
      .input('CustomerPhone', sql.NVarChar, customerPhone)
      .input('ReservationDate', sql.Date, reservationDate)
      .input('ReservationTime', sql.VarChar, formattedTime) // Use VarChar instead of Time
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
    
    // Check if date is Monday (restaurant closed)
    const selectedDate = new Date(date);
    if (selectedDate.getDay() === 1) {
      return res.json({
        success: true,
        data: { availableSlots: [] }
      });
    }
    
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
      const timeSlot = row.ReservationTime.substring(0, 5); // Convert from HH:MM:SS to HH:MM
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
      const twoHoursFromNow = currentTime + 120; // 2 hours advance notice
      
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

// ===== MENU MANAGEMENT ROUTES =====

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

// ===== ANALYTICS ROUTES =====

// Get analytics data
app.get('/api/analytics', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().execute('sp_GetAnalytics');
    
    res.json({
      success: true,
      data: result.recordsets // Multiple result sets from the stored procedure
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}`);
      console.log(`🗄️  Database: ${process.env.DB_DATABASE}`);
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