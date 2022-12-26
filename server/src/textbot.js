const User = require('./models/user');
const Delivery = require('./models/delivery');
const Admin = require('./models/admin');
const WorkTime = require('./models/workTime');
const Company = require('./models/company');
const Gate = require('./models/gate');
const { HOUR, DAY, toDateString, toTimeString, getTime, getWeekday, parseDate, parseTime } = require('./util/time');
const { sendText } = require('./util/util');

const main = async (req) => {
  const message = req.body.Body.trim();
  let user = await User.findOne({number: req.body.From});
  if (user === null) {
    user = new User({
      number: req.body.From,
      state: 'default'
    });
    user.save();
    return "Welcome to the Skanska delivery management text-bot.\nReply 'new' to schedule a delivery.\nReply 'today' to see today's schedule.\nReply 'info' to see a list of commands.";
  }

  if (message.toLowerCase() === 'delete') {
    User.findByIdAndDelete(user._id).then(x =>{});
    return "Deleted user.";
  }
  
  switch (user.state) {

    case 'delivery': {
      if (message.toLowerCase() == 'cancel') {
        user.delivery = null;
        user.state = 'default';
        user.save();
        return 'Your delivery request has been cancelled.';
      }
      
      switch (user.delivery.state) {

        case 'date': {
          try {
            user.delivery.date = parseDate(message);
          } catch {
            return "Given date could not be understood. Please use MM/DD format.\nReply 'info' for help.";
          }
          if (user.delivery.date - new Date().valueOf() < 2*DAY) {
            user.delivery.state = 'date';
            user.save();
            return `Deliveries must be scheduled 48 hours in advance. Please provide another date.\nReply 'cancel' to cancel delivery request.`
          }
          const workTime = await WorkTime.findOne({});
          const day = getWeekday(user.delivery.date);
          if (!workTime[day].active) {
            return `Deliveries cannot be scheduled on ${day}s. Please provide another date (MM/DD).\nReply 'cancel' to cancel delivery request.`
          }

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }

          user.delivery.state = 'time';
          user.save();
          return 'What is the start time of your delivery (HH:MM AM/PM)?';
        }
          
        case 'time': {
          try {
            user.delivery.start = parseTime(message);
            user.delivery.end = user.delivery.start + 1*HOUR;
          } catch {
            return "Given time could not be understood. Please use HH:MM AM/PM format.\nReply 'info' for help.";
          }
          const day = getWeekday(user.delivery.start);
          const workTime = await WorkTime.findOne({});
          if (user.delivery.start < workTime[day].start || user.delivery.start > workTime[day].end) {
            return `Deliveries on ${day}s must be between ${toTimeString(workTime[day].start)} and ${toTimeString(workTime[day].end)}\nPlease provide a valid time.\nReply 'cancel' to cancel delivery.`
          }

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }

          user.delivery.state = 'company';
          user.save();
          const companies = await Company.find({});
          let ret = "Please respond with the number of your company:\n";
          for (let i=0; i<companies.length; i++) {
            ret = ret + `${i+1}: ${companies[i].name}\n`;
          }
          return ret;
        }

        case 'company': {
          const companies = await Company.find({});
          try {
            user.delivery.company = companies[parseInt(message)-1].name;
          } catch {
            return "Please respond with a valid number";
          }

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }

          user.delivery.state = "description";
          user.save();
          return 'What is the item being delivered?';

        }

        case 'description': {
          user.delivery.description = message;

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
          
          user.delivery.state = 'gate';
          user.save();
          const gates = await Gate.find({});
          let ret = "Please respond with the number of your gate:\n";
          for (let i=0; i<gates.length; i++) {
            ret = ret + `${i+1}: ${gates[i].name}\n`;
          }
          return ret;
        }

        case 'gate': {
          const gates = await Gate.find({});
          try {
            user.delivery.gate = gates[parseInt(message)-1].name;
          } catch {
            return "Please respond with a valid number";
          }

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
          
          user.delivery.state = "location";
          user.save();
          return 'What is the drop-off location for your delivery?';
        }

        case 'location': {
          user.delivery.location = message;

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
          
          user.delivery.state = "contactName";
          user.save();
          return 'Who is the contact for your delivery?';
        }

        case 'contactName': {
          user.delivery.contactName = message;

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
          
          user.delivery.state = "contactNumber";
          user.save();
          return 'What is the number of the contact for your delivery? Reply "same" if you are using the contact number to schedule this delivery.';
        }

        case 'contactNumber': {
          if (message === 'same') {
            user.delivery.contactNumber = user.number;
          } else {
            user.delivery.contactNumber = message;
          }

          if (user.delivery.edit) {
            user.delivery.state = 'complete';
            user.save();
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
          
          user.delivery.state = 'notes';
          user.save();
          return "Please reply with any additional notes for your delivery (reply 'done' for no note)";
        }
        
        case 'notes': {
          if (message !== 'done') {
            user.delivery.notes = message;
          }

          user.delivery.state = 'complete';
          user.save();
          return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
        }

        case 'complete': {
          if (message.toLowerCase() !== 'yes') {
            user.delivery.state = 'edit';
            user.save();
            return 'Which field needs to be updated?';
          }
          const delivery = new Delivery({
            ...user.delivery,
            start: user.delivery.date + user.delivery.start,
            end: user.delivery.date + user.delivery.end,
            approved: false,
            completed: false,
            date: undefined,
            state: undefined,
            edit: undefined,
          });
          delivery.save();
          const text = `Delivery of ${delivery.description} scheduled for ${delivery.start}.`
          Admin.findOne({}).then(x => sendText(x.number, text));
          user.delivery = undefined;
          user.state = 'default';
          user.save();
          return 'Your delivery has been scheduled.\nThank You.';
        }
          
        case 'edit': {
          let field = 'none';
          if (user.delivery.hasOwnProperty(message.toLowerCase())) {
            field = message.toLowerCase();
          } else if (message.toLowerCase() === 'contact name') {
            field = 'contactName';
          } else if (message.toLowerCase() === 'contact number') {
            field = 'contactNumber';
          }
          if (field !== 'none') {
            user.delivery.state = field;
            user.delivery.edit = true;
            user.save();
            if (field === 'company') {
              const companies = await Company.find({});
              let ret = "Please respond with the number of your company:\n";
              for (let i=0; i<companies.length; i++) {
                ret = ret + `${i+1}: ${companies[i].name}\n`;
              }
              return ret;
            } else if (field === 'gate') {
              const gates = await Gate.find({});
              let ret = "Please respond with the number of your gate:\n";
              for (let i=0; i<gates.length; i++) {
                ret = ret + `${i+1}: ${gates[i].name}\n`;
              }
              return ret;
            } 
            else return "What is the new value?";
          }
          else return "Given field could not be understood. Please use exact field name from preceding message.\nReply 'info' for help.";
        }
      }    
    }  

    case 'schedule': {
      let date = null;
      try {
        date = parseDate(message);
      } catch {
        return "Given date could not be understood. Please use MM/DD format.\nReply 'info' for help.";
      }
      user.state = 'default';
      user.save();
      const deliveries = await Delivery.find({
        start: {
          $gt: date,
          $lt: date + DAY
        }
      }).sort({'start': 1})
      if (deliveries.length === 0) return `There are no deliveries scheduled for ${toDateString(date)}.`
      let ret = 'Deliveries:\n';
      deliveries.forEach(delivery => {
        ret = ret.concat(`${toTimeString(getTime(delivery.start))}- ${toTimeString(getTime(delivery.end))}: ${delivery.description} for ${delivery.company}\n`);
      })
      return ret;
    }
      
    default: {
      switch (message.toLowerCase()) {

        case 'schedule':
          user.state = 'schedule';
          user.save();
          return 'What date (MM/DD) do you want to view?';
        case 'today':
          const today = new Date()
          today.setHours(0,0, 0, 0);
          const date = today.valueOf();
          const deliveries = await Delivery.find({
            start: {
              $gt: date,
              $lt: date + DAY
            }
          }).sort({'start': 1})
          if (deliveries.length === 0) return `There are no deliveries scheduled for ${toDateString(date)}.`
          let ret = 'Deliveries:\n';
          deliveries.forEach(delivery => {
            ret = ret.concat(`${toTimeString(getTime(delivery.start))}- ${toTimeString(getTime(delivery.end))}: ${delivery.description} for ${delivery.company}\n`);
          })
          return ret;

        case 'new':
          user.state = 'delivery';
          user.delivery = {
            state: 'date',
          };
          user.save();
          return 'What is the date for your delivery (MM/DD)?';

        case 'info':
          return "Reply 'new' to schedule a new delivery.\nReply 'schedule' to see the schedule for a day.\nReply 'cancel' to cancel delivery request";
        
        case 'map':
          return "Site Map:"

        default: 
          return "Your command could not be understood. reply 'info' for a list of commands";
      }
    }
      
    }
};

const displayDelivery = (delivery) => {
  const ret = `Date: ${toDateString(delivery.date)}
  Time: ${toTimeString(delivery.start)}
  Company: ${delivery.company}
  Description: ${delivery.description}
  Gate: ${delivery.gate}
  Location: ${delivery.location}
  Contact Name: ${delivery.contactName}
  Contact Number: ${delivery.contactNumber}
  Notes: ${delivery.notes}`;
  return ret;
}

module.exports = main;