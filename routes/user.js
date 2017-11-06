let User = require('../models/user.js');

module.exports = function (router) {

    let userRoute = router.route('/users');

    // get request
    userRoute.get(function (req, res) {
        
        // handle query string
        if(req.query){
            let where;
            let sort;
            let select;
            let skip = parseInt(req.query.skip)||0;
            let limit = parseInt(req.query.limit)||Number.MAX_SAFE_INTEGER;
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
                User.
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
                User.
                find(where).
                skip(skip).
                limit(limit).
                sort(sort).
                select(select).
                exec(function(err, users){
                    if(err){
                        res.status(500).json({message:"Server error", data:[]});
                    }
                    else{
                        res.json({message:'OK!',data:users});
                    }
                });
            }


        }

        // default behavior
        else{
            User.find(function(err, users){
                if(err){
                    res.status(500).json({message:"Server error", data:[]});
                }

                res.status(200).json({message:'OK!', data:users});
            });
        }
    });

    // post request
    userRoute.post(function (req, res) {
        
        if(!req.body.name || !req.body.email){
            // if name or email does not exist
            res.status(400).json({message:'User cannot be created without name or email', data:[]});
        }

        else{
            let name = req.body.name;
            let email = req.body.email;
            let pendingTasks = req.body.pendingTasks||[];

            let user = new User();
            user.name = name;
            user.email = email;
            user.pendingTasks = pendingTasks;

            user.save(function(err) {
                if (err){
                    if(err.code == 11000){
                        // duplicate email
                        return res.status(400).json({message:'Email already in use', data:[]});
                    }
                    else{
                        return res.status(500).json({message:"Server error", data:[]});
                    }
                }

                res.status(201).json({ message: 'User created!', data:user });
            });
        }
    });

    // options request
    userRoute.options(function (req, res) {
        
        res.status(200).json({message: 'GET method can take parameters!',
                  data: [{parameters:'where', description:'filter results based on JSON query'},
                         {parameters:'sort', description:'specify the order in which to sort each specified field (1- ascending; -1 - descending)'},
                         {parameters:'select', description:'specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)'},
                         {parameters:'skip', description:'specify the number of results to skip in the result set; useful for pagination'},
                         {parameters:'limit', description:'specify the number of results to return (default should be 100 for tasks and unlimited for users)'},
                         {parameters:'count', description:'if set to true, return the count of documents that match the query (instead of the documents themselves)'}
                  ]});
    });


    // for user id request
    let useridRoute = router.route('/users/:id');

    // get request
    useridRoute.get(function (req, res){
        
        User.findById(req.params.id, function(err, user) {
            if (err){
                res.status(500).json({message:"Server error", data:[]});
            }

            if(!user){
                res.status(404).json({message:'Cannot find the user with given ID', data:[]});
            }

            else{
                res.status(200).json({message: 'OK!', data:user});
            }
        });
    });

    // put request
    useridRoute.put(function (req, res) {
        
        User.findById(req.params.id, function(err, user) {

            if (err){
                res.status(500).json({message:"Server error", data:[]});
            }

            // if we do not find the user
            if(!user){
                res.status(404).json({message:'Cannot find the user with given ID', data:[]});
            }

            else{
                
                if(!req.body.name || !req.body.email){
                    // if name or email does not exist
                    res.status(400).json({message:'User cannot be created without name or email', data:[]});
                }

                else{

                    // update user info here
                    user.name = req.body.name||user.name;
                    user.email = req.body.email||user.email;
                    user.pendingTasks = req.body.pendingTasks||user.pendingTasks;

                    // save the updated info
                    user.save(function(err) {
                        if (err){
                            if(err.code == 11000){
                                return res.status(400).json({message:'Email already in use', data:[]});
                            }
                            else{
                                return res.status(500).json({message:'Cannot modify the user with given ID', data:[]});
                            }
                        }

                        res.status(200).json({ message: 'User updated!', data:user });
                    });
                }
            }

        });
    });

    // delete request
    useridRoute.delete(function (req, res) {

        User.findById(req.params.id, function(err, user) {
            if(err){
                 res.status(500).json({message:"Server error", data:[]});
            }
            if(!user){
                res.status(404).json({message:'Cannot find the user with given ID', data:[]});
            }

            else{
                User.remove({
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
