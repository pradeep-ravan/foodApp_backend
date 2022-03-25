module.exports.createElement = function (ElementModel) {
    return async function (req, res) {
        try{
            let element = req.body;
            if (element) {
                    element = await ElementModel.create(element);
                    res.status(200).json({
                    element: element
                });
            } else {
                res.status(200).json({
                    message: "kindly enter data"
                });
            }
        }catch (err){
            console.log(err);
            res.status(500).json({
                message: "Server error"
            })
        }
    }
}
module.exports.getElements = function (ElementModel) {
    return async function(req, res){
        try{
            //console.log(req.query);
            let ans = JSON.parse(req.query.myquery);
            console.log("ans",ans);
            let elementsQuery = ElementModel.find(ans);
            let sortField = req.query.sort;
            let sortQuery = elementsQuery.sort(`-${sortField}`);
            let params = req.query.select.split("%").join(" ");
            let fileteredQuery = sortQuery.select(`${params} -_id`);
            //pagination
            let page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 3;
            let toSkip = (page - 1) * limit;
            let paginatedResultPromise = fileteredQuery.skip(toSkip).limit(limit);
            let result = await paginatedResultPromise;
            res.status(200).json({
                "message": "list of all the elements",
                Elements: result
            })
        }catch(err) {
            res.status(500).json({
                error:err.message,
                "message": "can't get elements"
            })
        }
       
    }
}
module.exports.updateElement = function (ElementModel) {
    return async function (req, res) {
        let {id} = req.body;
        try{
            // await ElementModel.findByIdAndUpdate({ _id:id }, req.body,{runValidators:true}); 
            let element = await ElementModel.findbyId(id); 
            if (element) {
                delete req.body.id
                for(let key in req.body){
                    element[key] = req.body[key];
                }
                await element.save();
                res.status(200).json(element);
            }else {
                res.status(404).json({
                    message: "resource not found"
                })
            }
        }catch (err) {
            console.log(err);
            res.status(500).json({
                message: "server error"
            });
        }
        // email send to 
        // nodemailer -> through table tag
        //service -. gmail
           
        }
}
module.exports.deleteElement = function (ElementModel) {
    return async function deletePlan(req, res){
        let { id } = req.body;
        try{
            let element = await ElementModel.findByIdAndDelete(id, req.body); 
           // let element = await ElementModel.findOne({ _id: id }); 
            if(!element){
                res.status(404).json({
                    message: "resource not found"
                })
            } else {
                res.status(200).json(element);
            }
            
        }catch (err) {
            console.log(err);
            res.status(500).json({
                message: "server error"
            });
        }
    }
   
}
module.exports.getElementById = function (ElementModel){
    return async function (req, res) {
        try{
             let id = req.params.id;
            let element = await ElementModel.getElementById(id);
            res.status(200).json({
                element: element
            });
        }catch (err) {
            console.log(err);
            res.status(500).json({
                message: "server error"
            });
        }
           
        } 
}