
const Chart = require('chart.js');

const db = require('../config/database');


exports.getChartData1 = (req, res) => {
    db.query("SELECT event, COUNT(*) as count FROM interactions WHERE event = 'click' GROUP BY event", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData2 = (req, res) => {
    db.query("SELECT event, COUNT(*) as count FROM interactions WHERE event = 'leave' GROUP BY event", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};


exports.getChartData3 = (req, res) => {
    db.query("SELECT page, COUNT(*) as count FROM interactions WHERE event = 'visit' GROUP BY page", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData4 = (req, res) => {
    db.query("SELECT page, SUM(duration) as total_duration FROM interactions WHERE event = 'visit' GROUP BY page", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData5 = (req, res) => {
    db.query("SELECT DATE(timestamp) as date, COUNT(*) as total_interactions FROM interactions GROUP BY date", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData6 = (req, res) => {
    db.query("SELECT event, AVG(duration) as avg_duration FROM interactions GROUP BY event", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData7 = (req, res) => {
    db.query("SELECT page, COUNT(*) as total_interactions FROM interactions WHERE event = 'visit' GROUP BY page", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData8 = (req, res) => {
    db.query("SELECT DAYOFWEEK(timestamp) as day_of_week, COUNT(*) as total_interactions FROM interactions GROUP BY day_of_week", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData9 = (req, res) => {
    db.query("SELECT   element, COUNT(*) AS total_interactions FROM   interactions GROUP BY element;", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};
exports.getChartData10 = (req, res) => {
    db.query("SELECT event, COUNT(*) as count FROM interactions WHERE event = 'visit' GROUP BY event", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};

exports.getChartData11 = (req, res) => {
    db.query("SELECT page,SUM(duration) AS total_duration FROM interactions WHERE event = 'visit' GROUP BY page; ", (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
};