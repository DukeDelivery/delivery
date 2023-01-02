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
        user.state = 'cancel';
      }
      let skip = false;
      switch (user.delivery.state) {

        case 'date': {
          try {
            user.delivery.date = parseDate(message);
          } catch {
            return "Given date could not be understood. Please use MM/DD format.\nReply 'info' for help.";
          }
          if (user.delivery.date - new Date().valueOf() < 2*DAY) {
            return `Deliveries must be scheduled 48 hours in advance. Please provide another date.\nReply 'cancel' to cancel delivery request.`
          }
          const workTime = await WorkTime.findOne({});
          const day = getWeekday(user.delivery.date);
          if (!workTime[day].active) {
            return `Deliveries cannot be scheduled on ${day}s. Please provide another date.\nReply 'cancel' to cancel delivery request.`
          }
          user.delivery.state = 'time';
          break;
        }
          
        case 'time': {
          try {
            user.delivery.start = parseTime(message);
            user.delivery.end = user.delivery.start + 0.5*HOUR;
          } catch {
            return "Given time could not be understood. Please use HH:MM AM/PM format.\nReply 'info' for help.";
          }
          const day = getWeekday(user.delivery.start);
          const workTime = await WorkTime.findOne({});
          if (user.delivery.start < workTime[day].start || user.delivery.start > workTime[day].end) {
            return `Deliveries on ${day}s must be between ${toTimeString(workTime[day].start)} and ${toTimeString(workTime[day].end)}\nPlease provide a valid time.\nReply 'cancel' to cancel delivery.`
          }
          user.delivery.state = 'company';
          break;
        }
        case 'company': {
          const companies = await Company.find({});
          try {
            user.delivery.company = companies[parseInt(message)-1].name;
          } catch {
            return "Please respond with a valid number";
          }
          user.delivery.state = "description";
          break;
        }
        case 'description': {
          user.delivery.description = message;
          user.delivery.state = 'gate';
          break;
        }
        case 'gate': {
          const gates = await Gate.find({});
          try {
            user.delivery.gate = gates[parseInt(message)-1].name;
          } catch {
            return "Please respond with a valid number";
          }
          user.delivery.state = "trucks";
          break;
        }
        case 'trucks': {
          if (isNaN(parseInt(message))) {
            return "Response could not be understood. Please respond with a number. Reply 'info' for help.";
          }
          user.delivery.trucks = parseInt(message);
          user.delivery.state = "contactName";
          break;
        }
        case 'contactName': {
          user.delivery.contactName = message;
          user.delivery.state = "contactNumber";
          break;
        }
        case 'contactNumber': {
          if (message === 'same') {
            user.delivery.contactNumber = user.number;
          } else {
            user.delivery.contactNumber = message;
          }
          user.delivery.state = 'notes';
          break;
        }
        case 'notes': {
          if (message !== 'done') {
            user.delivery.notes = message;
          }
          user.delivery.state = 'complete';
          break;
        }
        case 'complete': {
          if (message.toLowerCase() !== 'yes') {
            user.delivery.state = 'edit';
          } else {
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
            user.delivery.state = 'save';
          }
          break;
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
          if (field === 'none') {
            return "Given field could not be understood. Please use exact field name from preceding message.\nReply 'info' for help.";
          }
          user.delivery.state = field;
          user.delivery.edit = true;
          skip = true;
          break;
        }

      }
      if (user.delivery.edit && !skip) {
        user.delivery.edit = false;
        user.delivery.state = 'complete';
      }
      break;    
    }  
    case 'schedule': {
      let date = null;
      try {
        date = parseDate(message);
      } catch {
        return "Given date could not be understood. Please use MM/DD format.\nReply 'info' for help.";
      }
      user.delivery.state = 'schedule';
      user.schedule = {
        'date': date,
      }
      break;
    }
      
    default: {
      switch (message.toLowerCase()) {

        case 'schedule': {
          user.state = 'schedule';
          user.schedule = {};
          break;
         }
        case 'today': {
          const today = new Date()
          today.setHours(0,0, 0, 0);
          const date = today.valueOf();
          user.schedule = {
            'date': date
          }
          user.state = 'schedule';
          break;
        }
          
        case 'new': {
          console.log("hello");
          user.state = 'delivery';
          user.delivery = {
            state: 'date',
          };
          break;
        }
          
        case 'info': {
          user.state = 'info';
          break;
        }
         
        case 'map': {
          user.state = 'map';
          break;
        }
        default: {
          user.state = 'error';
        }
      }
    }  
  }
  console.log(user.delivery);
  switch (user.state) {

    case 'delivery': {
      switch (user.delivery.state) {
        case 'date': {
          user.save();
          return 'What is the date for your delivery (MM/DD)?';
        }
        case 'time': {
          user.save();
          return 'What is the start time of your delivery (HH:MM AM/PM)?';
        }
        case 'company': {
          user.save();
          const companies = await Company.find({});
          let ret = "Please respond with the number of your company:\n";
          for (let i=0; i<companies.length; i++) {
            ret = ret + `${i+1}: ${companies[i].name}\n`;
          }
          return ret;

        }
        case 'description': {
          user.save();
          return 'What is the item being delivered?';
        }
        case 'gate': {
          user.save();
          const gates = await Gate.find({});
          let ret = "Please respond with the number of your gate:\n";
          for (let i=0; i<gates.length; i++) {
            ret = ret + `${i+1}: ${gates[i].name}\n`;
          }
          return ret;
        }

        case 'trucks': {
          user.save();
          return 'How many trucks are needed for your delivery?';
        }

        case 'contactName': {
          user.save();
          return 'Who is the contact for your delivery?';
        }

        case 'contactNumber': {
          user.save();
          return 'What is the number of the contact for your delivery? Reply "same" if you are using the contact number to schedule this delivery.';
        }
        
        case 'notes': {
          user.save();
          return "Please reply with any additional notes for your delivery (reply 'done' for no note)";
        }

        case 'complete': {
          user.save();
          return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
        }
          
        case 'edit': {
          user.save();
          return 'Which field needs to be updated?';
        }
        case 'save': {
          user.delivery = undefined;
          user.state = 'default';
          user.save();
          return 'Your delivery has been scheduled.\nThank You.';
        }
      }    
    }  

    case 'schedule': {
      if (user.schedule.date === undefined) {
        user.save();
        return 'What date (MM/DD) do you want to view?';
      }
      const deliveries = await Delivery.find({
        start: {
          $gt: user.schedule.date,
          $lt: user.schedule.date + DAY
        }
      }).sort({'start': 1})
      if (deliveries.length === 0) return `There are no deliveries scheduled for ${toDateString(user.schedule.date)}.`
      let ret = 'Deliveries:\n';
      deliveries.forEach(delivery => {
        ret = ret.concat(`${toTimeString(getTime(delivery.start))}- ${toTimeString(getTime(delivery.end))}: ${delivery.description} for ${delivery.company}\n`);
      })
      user.state = 'default';
      user.save();
      return ret;
    }
    case 'info': {
      user.state = 'default';
      user.save();
      return "Reply 'new' to schedule a new delivery.\nReply 'schedule' to see the schedule for a day.\nReply 'cancel' to cancel delivery request";
    }
    case 'map': {
      user.state = 'default';
      user.save();
      return"Site Map:";
    }
    case 'error': {
      user.state = 'default';
      user.save();
      return "Your command could not be understood. reply 'info' for a list of commands";
    }
    case 'cancel': {
      user.state = 'default';
      user.save();
      return "Your delivery has been cancelled.";
    }

  }
};

const displayDelivery = (delivery) => {
  const ret = `Date: ${toDateString(delivery.date)}
  Time: ${toTimeString(delivery.start)}
  Company: ${delivery.company}
  Description: ${delivery.description}
  Gate: ${delivery.gate}
  Trucks: ${delivery.trucks}
  Contact Name: ${delivery.contactName}
  Contact Number: ${delivery.contactNumber}
  Notes: ${delivery.notes}`;
  return ret;
}

module.exports = main;