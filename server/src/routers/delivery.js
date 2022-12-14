const express = require('express');
const { sendText } = require('../util/util');
const Delivery = require('../models/delivery');
const Company = require('../models/company');
const { toDateTimeString } = require('../util/time');
const Admin = require('../models/admin');

const router = express.Router();

router.get('/', async (req, res) => {
  Delivery.find({}).then(x => res.json(x));
});

router.get('/:id', (req, res) => {
  Delivery.findById(req.params.id).then(x => res.json(x));
})

router.post('/', async (req, res) => {
  const delivery = await new Delivery({...req.body});
  delivery.save();
  message = `Delivery of ${delivery.description} scheduled for ${toDateTimeString(delivery.start)}.`
  Admin.findOne({}).then(x => sendText(x.number, message));

  const company = await Company.findOne({'name': delivery.company});
  company.contacts.forEach(contact => sendText(contact.number, message)); 
  sendText(delivery.contactNumber, message);
  res.end('Delivery added to Database');
});

router.patch('/:id', async (req, res) => {
  const delivery = await Delivery.findById(req.body.id);
  let message;
  if (req.body.approved === true && delivery.approved === false) {
    message = `Your '${delivery.description}' delivery on ${toDateTimeString(delivery.start)} has been approved by the administrator.`
  } else if (req.body.approved === false && delivery.approved === true) {
    message = `Your '${delivery.description}' delivery on ${toDateTimeString(delivery.start)} has been unapproved by the administrator.`
  } else {
    message = `Your '${delivery.description}' delivery on ${toDateTimeString(delivery.start)} has been edited by the administrator. See calendar for details.`
  }

  const company = await Company.findOne({'name': delivery.company});
  company.contacts.forEach(contact => sendText(contact.number, message));
  sendText(delivery.contactNumber, message);

  Delivery.findByIdAndUpdate(req.body.id, {...req.body})
    .then(x => res.json(x));
})

router.delete('/:id', async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  const message = `Your '${delivery.description}' delivery for ${toDateTimeString(delivery.start)} has been deleted by the administrator.`
  sendText(delivery.contactNumber, message);

  const company = await Company.findOne({'name': delivery.company});
  //company.contacts.forEach(contact => sendText(contact.number, message));

  delivery.delete()
    .then(() => res.end('Delivery removed from database'));
})

module.exports = router;