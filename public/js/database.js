const pool = require("../../dbPool.js");

module.exports = {
    getActivites: async (userId) => {
        let rows = await executeSQL(sql.userActivites, [userId]);
        return rows;
    },
    getAllActivites: async () => {
        let rows = await executeSQL(sql.getAllActivites, []);
        return rows;
    },
    getCurrentChallenge: async (userId) => {
        let rows = await executeSQL(sql.getCurrentChallenge, [userId]);
        return rows;
    },
    getPreviousChallenges: async (userId) => {
        let rows = await executeSQL(sql.getPreviousChallenges, [userId]);
        return rows;
    },
    createChallenge: async (userId, name, start, length, end, weeklySpend, numDrinks) => {
        let rows = await executeSQL(sql.createChallenge, [userId, name, start, length, end, 1, weeklySpend, numDrinks]);
        return rows;
    },
    endChallenge: async (id) => {
        let today = new Date();
        let rows = await executeSQL(sql.endChallenge, [today, id]);
        return rows;
    },
    getJournalEntries: async(userId) => {
        let rows = await executeSQL(sql.getJournalEntries, [userId]);
        return rows;
    },
    createChallengeActivity: async(challengeId, type, desc, title, content, happy, sad, craving, overwhelemd, tired) => {
        let today = new Date();
        let rows = await executeSQL(sql.createChallengeActivity, [challengeId, today, type, desc, title, content, happy, sad, craving, overwhelemd, tired]);
        return rows;
    },
    getReportMetrics: async(userId) => {
        let rows = await executeSQL(sql.getReportMetrics, [userId]);
        return rows;
    }
}

const sql = {
    userActivites: "select * from activities where UserId = ?;",
    getAllActivites: "select * from activities;",
    getCurrentChallenge: `select c.id, CAST(dateStarted as CHAR) as dateStarted, challengeLength, expectedEndDate,  datediff(CURDATE(), dateStarted) as daysCompleted, isActive, challengeName` +
        ` from challenge c join users u on c.userid = u.id where u.id = ? and isActive = 1;`,
    getPreviousChallenges: `select c.id, CAST(dateStarted as CHAR) as dateStarted, challengeLength, expectedEndDate, CAST(actualEndDate as CHAR) as actualEndDate, datediff(actualEndDate, dateStarted) as daysCompleted, isActive, challengeName` +
        ` from challenge c join users u on c.userid = u.id where u.id = ? and isActive = 0 order by dateStarted desc;`,
    createChallenge: `insert into challenge (userId, challengeName, dateStarted, challengeLength, expectedEndDate, isActive, drinksPerWeek, savingsPerWeek) values (?, ?, ?, ?, ?, ?, ?, ?);`,
    endChallenge: `update challenge set isActive = 0, actualEndDate = ? where id = ?;`,
    getJournalEntries: `select ca.id as activityId,CAST(ca.activityDate AS CHAR) as activityDate,ca.activityType,ca.activityTitle,ca.activityDescription,c.id as challengeId,
    u.id as userId from challengeActivity ca join challenge c on ca.challengeId = c.id join users u on u.id = c.userid where activityType = 'journal entry' and u.id = ? order by activityDate desc;`,
    createChallengeActivity: `insert into challengeActivity (challengeId, activityDate, activityType, activityDescription, activityTitle, content, happy, sad, cravings, overwhelemd, tired) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    getReportMetrics: `select c.id, max(datediff(IF(isActive=0, actualEndDate, CURDATE()), dateStarted)) as longestStreak, count(isActive) as totalChallenges
    from challenge c join users u on c.userid = u.id where u.id = ?;`
}

//functions
async function executeSQL(sql, params) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, params, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}