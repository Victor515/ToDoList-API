let Task = require('../models/task.js');

module.exports = function (router) {

    let taskRoute = router.route('/tasks');

    // get request
    taskRoute.get(function (req, res) {

        // handle query string
        if(req.query.length !== 0){
            let where;
            let sort;
            let select;
            let skip = parseInt(req.query.skip)||0;
            let limit = parseInt(req.query.limit)||100;
            let count = req.query.count||false;
            
            // parse string to JSON
            if(req.query.where != undefined){
                where = JSON.parse(req.query.where);
            }
            else{
                where = {};
            }
            if(req.query.sort != undefined){
                sort = JSON.parse(req.query.sort);
            }
            else{
                sort = {};
            }
            if(req.query.select != undefined){
                select = JSON.parse(req.query.select);
            }
            else{
                select = {};
            }


            //console.log(sort);
            res.status(200);
            //res.send("I am testing!");
            
            // if a count should be returned
            if(count){
                Task.
                count(where).
                skip(skip).
                limit(limit).
                sort(sort).
                select(select).
                exec(function(err, counts){
                    if(err){
                        res.status(500).json({message:"Server error", data:[]});
                    }
                    else{
                        res.json({message:'OK!',data:counts});
                    }
                });

            }

            else{
                Task.
                find(where).
                skip(skip).
                limit(limit).
                sort(sort).
                select(select).
                exec(function(err, tasks){
                    if(err){
                        res.status(500).json({message:"Server error", data:[]});
                    }
                    else{
                        if(tasks.length === 0){
                            res.status(404).json({message:"No tasks found", data:tasks});
                        }
                        else{
                            res.json({message:'OK!',data:tasks});
                        }
                    }
                });
            }


        }

        // default behavior
        else{
            Task.
            find().
            limit(100).
            exec(function(err, tasks){
                if(err){
                    res.status(500).json({message:"Server error", data:[]});
                }

                res.status(200).json({message:'OK!', data:tasks});
            });
        }
    });

    // post request
    taskRoute.post(function (req, res) {
        if(!req.body.name || !req.body.deadline){
            res.status(400).json({message:"Tasks cannot be created without a name or a deadline", data:[]});
        }

        else{
            let task = new Task();

            task.name = req.body.name;
            task.deadline = req.body.deadline;
            task.description = req.body.description||"";
            task.completed = req.body.completed||false;
            task.assignedUser = req.body.assignedUser||"default";
            task.assignedUserName = req.body.assignedUserName||"unassigned";

            task.save(function(err) {
                if (err)
                    return res.status(500).json({message:'Server error', data:[]});

                res.status(201).json({ message: 'Task created!', data:task });
            });
        }
    });

    // options request
    taskRoute.options(function (req, res) {

        res.status(200).json({message: 'GET method can take parameters!',
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
                res.status(500).json({message:'Server error', data:[]});
            }

            if(!task){
                res.status(404).json({message:'Cannot find the task with given ID', data:[]});
            }

            else{
                res.status(200).json({message: 'OK!', data:task});
            }
        });
    });

    // put request
    taskidRoute.put(function (req, res) {

        Task.findById(req.params.id, function(err, task) {

            if (err){
                res.status(500).json({message:'Server error', data:[]});
            }

            // if we do not find the user
            if(!task){
                res.status(404).json({message:'Cannot find the task with given ID', data:[]});
            }

            else{
                if(!req.body.name || !req.body.deadline){
                    res.status(400).json({message:"Tasks cannot be updated without a name or a deadline", data:[]});
                }

                else{
                    // update info
                    task.name = req.body.name||task.name;
                    task.description = req.body.description||task.description;
                    task.deadline = req.body.deadline||task.deadline;
                    task.completed = req.body.completed||task.completed;
                    task.assignedUser = req.body.assignedUser||task.assignedUser;
                    task.assignedUserName = req.body.assignedUserName||task.assignedUserName;


                    // save the task
                    task.save(function(err) {
                        if (err){
                            return res.status(500).json({message:'Server error', data:[]});
                        }

                    res.status(200).json({ message: 'task updated!', data:task });
                    });
                }
            }

        });
    });

    // delete request
    taskidRoute.delete(function (req, res) {

        Task.findById(req.params.id, function(err, task) {
            if(err){
               res.status(500).json({message:"Server error", data:[]});
            }
            if(!task){
                res.status(404).json({message:'Cannot find the tasks with given ID', data:[]});
            }

            else{
                Task.remove({
                    _id: req.params.id
                }, function(err, user) {
                    if (err)
                        res.status(500).json({message:"Server error", data:[]});

                res.status(200).json({ message: 'Successfully deleted', data:[] });
            });
            }

        });
    });

    return router;
}
