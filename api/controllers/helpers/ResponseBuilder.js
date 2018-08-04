let self = module.exports = {
    build: function(res, code, content) {
        res.header('Cache-Control', 'public')
        return res.status(code).json(content);
    }
}
