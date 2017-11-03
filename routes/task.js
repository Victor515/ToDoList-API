let Task = require('../models/task.js');

module.exports = function (router) {

    let taskRoute = router.route('/tasks');

    // get request
    taskRoute.get(function (req, res) {
        Task.find(function(err, tasks){
            if(err){
                res.json({message:'Cannot get tasks', data:[]});
            }

            res.json({message:'OK!', data:tasks});
        })
    });

    // post request
    taskRoute.post(function (req, res) {
        let task = new Task();

        task.name = req.body.name;
        task.deadline = req.body.deadline;

        task.save(function(err) {
            if (err)
                res.json({message:'Cannot add the task', data:[]});

            res.json({ message: 'Task created!', data:task });
        });
    });

    // options request
    taskRoute.options(function (req, res) {

        res.json({message: 'GET method can take parameters!',
                  data: [{parameters:'where', description:'filter results based on JSON query'},
                         {parameters:'sort', description:'specify the order in which to sort each specified field (1- ascending; -1 - descending)'},
                         {parameters:'select', description:'specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)'},
                         {parameters:'skip', description:'specify the number of results to skip in the result set; useful for pagination'},
                         {parameters:'limit', description:'specify the number of results to return (default should be 100 for tasks and unlimited for users)'},
                         {parameters:'count', description:'if set to true, return the count of documents that match the query (instead of the documents themselves)'}
                  ]});
    });


    // for task id request
    let taskidRoute = router.route('/tasks/:id');

    // get request
    taskidRoute.get(function (req, res) {

       Task.findById(req.params.id, function(err, task) {
            if (err){
                res.json({message:'Cannot find the task with given ID', data:[]});
            }
            res.json({message: 'OK!', data:task});
        });
    });

    // put request
    taskidRoute.put(function (req, res) {

        Task.findById(req.params.id, function(err, task) {

            if (err){
                res.json({message:'Cannot modify the task with given ID', data:[]});
            }

            // update info
            task.name = req.body.name||task.name;
            task.description = req.body.description||task.description;
            task.deadline = req.body.deadline||task.deadline;
            task.completed = req.body.completed||task.completed;
            task.assignedUser = req.body.assignedUser||task.assignedUser;
            task.assignedUserName = req.body.assignedUserName||task.assignedUserName;


            // save the bear
            task.save(function(err) {
                if (err){
                    res.json({message:'Cannot modify the task with given ID', data:[]});
                }

                res.json({ message: 'task updated!', data:task });
            });

        });
    });

    // delete request
    taskidRoute.delete(function (req, res) {

        Task.remove({
            _id: req.params.id
        }, function(err, task) {
            if (err)
                res.json({message:'Cannot delete the task with given ID', data:[]});

            res.json({ message: 'Successfully deleted', data:[] });
        });
    });

    return router;
}
