const express = require('express');
const router = express.Router();
////////\\\\\\ controller contains our route handlers in exports. (instead of const) form.
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

//////////////\\\\\\\  params middleware  /////////\\\\\\\\\\\\\
// router.param('id', tourController.checkId)

/////////\\\\\\\\\  ~ TOURS ROUTES ~ ////////////////\\\\\\\\\\\
// get request to our tours main endpoint
// router.get('/', tourController.getAllTours);
//post request to the tours endpoint
// router.post('/',  tourController.createNewTour)

//// EXPRESS NESTED ROUTES
router.use('/:tourId/reviews', reviewRouter);



router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createNewTour);
router.route('/tours-stats').get(tourController.getTourStats)
// get top 5 cheap route we use the alias top TOurs middleware inside controller
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

// for loading and deleting pre-set data
/////////////////////////////////////////////////////////////
router.delete('/delete-all-tours',tourController.deleteData);
router.post('/import-all-tours', tourController.importData);
/////////////////////////////////////////////////////////////

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan, authController.protect, authController.restrictTo('admin','lead-guide'))
// using an id type get response, emphasis on req.params = url parameters
router.get('/:id', tourController.getTour)
// using the PATCH http method we would be updating our file
router.patch('/:id', authController.protect, authController.restrictTo('admin','lead-guide', 'guide'), tourController.updateTour)
// delete http method
router.delete('/:id', authController.protect, authController.restrictTo('admin','lead-guide'), tourController.deleteTour)

//  router.get('/top-5-cheap', (tourController.aliasTopTours, tourController.getAllTours));





// we can go further and instead of repeating url, just chain all method associated to it

// app.route('/api/v1/tours/').get(tourControllergetAllTours).post(tourController.checkBody, tourController.createNewTour);
// app.route('api/v1/tours/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = router;