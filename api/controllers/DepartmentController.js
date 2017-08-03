/**
 * DepartmentController
 *
 * @description :: Server-side logic for managing departments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getDepartments: function(req, res) {
        Department.find()
            .exec(function(err, departments) {
                if (err) {
                    return res.json(err)
                }
                return res.json(departments)
            })
    }
}
