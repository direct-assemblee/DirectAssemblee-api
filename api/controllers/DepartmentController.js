module.exports = {
	getDepartments: function(req, res) {
		Department.find()
		.exec(function(err, departments) {
			if (err) {
				return res.json(err);
			}
			return res.json(departments)
		})
	}
};
