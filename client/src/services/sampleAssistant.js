export function getFakeAssistantReply(userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.includes("specials")) {
    return "Today's specials are grilled salmon, mushroom risotto, and mango cheesecake.";
  }

  if (msg.includes("vegan") || msg.includes("vegetarian")) {
    return "We offer vegan curry, quinoa salad, and dairy-free chocolate mousse.";
  }

  if (msg.includes("gluten")) {
    return "Our gluten-free options include grilled chicken, rice bowls, and flourless chocolate cake.";
  }

  if (msg.includes("reservation")) {
    return "You can make a reservation by calling us or using the 'Reserve' button on our website.";
  }

  if (msg.includes("hours") || msg.includes("open")) {
    return "We're open from 11 AM to 10 PM, Monday through Saturday.";
  }

  if (msg.includes("order history")) {
    return "If you have an account, you can view your past orders under the 'My Orders' section.";
  }

  if (msg.includes("account") || msg.includes("preferences")) {
    return "Creating an account lets you save preferences, manage reservations, and view your order history.";
  }

  return "I'm here to help with menu questions, dietary info, and reservations!";
}