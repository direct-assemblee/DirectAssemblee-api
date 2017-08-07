module.exports = {
    roundToTwoDecimals: function(num) {
        return +(Math.round(num + "e+2")  + "e-2");
    }
}
