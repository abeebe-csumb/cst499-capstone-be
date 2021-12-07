var token = $.cookie("XSRF-TOKEN");
const userId = $("#userId").val();

function days() {
    var d, values = {};
    for (i = 14; i >= 1; i--) {
        d = new Date();
        d.setDate(d.getDate() - i)
        values[d.toLocaleDateString()] = 0;
    }
    return values;
};

async function getUserReport(reportNum) {
    return await fetch(`/report${reportNum}?id=${userId}`, {
        method: 'GET',
        credentials: 'include',
        authorization: token,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            return data;
        });
}

async function report1() {
    let results = await getUserReport(1);

    var report1Data = days();
    for (let i = 0; i < results.length; i++) {
        report1Data[new Date(results[i].activitydate).toLocaleDateString()] = results[i].num_entries;
    }

    const data = {
        labels: Object.keys(report1Data),
        datasets: [{
            label: 'Daily Journal Entries (14 days)',
            data: Object.values(report1Data),
            fill: true,
            borderColor: 'rgb(7, 59, 76)',
            tension: 0.1
        }]
    };
    const config = {
        color: '#fff',
        type: 'line',
        data: data,
    };
    
    const myChart = new Chart(
        document.getElementById('chart1'),
        config,
    );
}

async function report2() {
    let results = await getUserReport(2);

    var report2Data = days();

    Object.keys(report2Data).forEach(v => report2Data[v] =  {
        content: 0,
        happy: 0,
        sad: 0,
        cravings: 0,
        over: 0,
        tired: 0
    });

    for (let i = 0; i < results.length; i++) {
        let row = results[i];
        report2Data[new Date(results[i].activitydate).toLocaleDateString()] = 
            {
                content: row.count_content,
                happy: row.count_happy,
                sad: row.count_sad,
                cravings: row.count_cravings,
                over: row.count_over,
                tired: row.count_tired
        };
    }

    let content = [];
    Object.keys(report2Data).forEach(v => content.push(report2Data[v].content));

    let happy = [];
    Object.keys(report2Data).forEach(v => happy.push(report2Data[v].happy));

    let sad = [];
    Object.keys(report2Data).forEach(v => sad.push(report2Data[v].sad));

    let cravings = [];
    Object.keys(report2Data).forEach(v => cravings.push(report2Data[v].cravings));

    let over = [];
    Object.keys(report2Data).forEach(v => over.push(report2Data[v].over));

    let tired = [];
    Object.keys(report2Data).forEach(v => tired.push(report2Data[v].tired));

    const data = {
        labels: Object.keys(report2Data),
        color: '#fff',
        datasets: [{
            label: 'Count Content',
            data: content,
            fill: true,
            borderColor: '#9bc53d',
            tension: 0.1
        },
        {
            label: 'Count Happy',
            data: happy,
            fill: true,
            borderColor: '#ffd166',
            tension: 0.1
        },
        {
            label: 'Count Sad',
            data: sad,
            fill: true,
            borderColor: '#55c1ff',
            tension: 0.1
        },
        {
            label: 'Count Cravings',
            data: cravings,
            fill: true,
            borderColor: '#fe4a49',
            tension: 0.1
        },
        {
            label: 'Count Overwhelmed',
            data: over,
            fill: true,
            borderColor: '#ca2e55',
            tension: 0.1
        },
        {
            label: 'Count Tired',
            data: tired,
            fill: true,
            borderColor: '#420040',
            tension: 0.1
        }]
    };
    const config = {
        type: 'line',
        data: data
    };
    
    const myChart = new Chart(
        document.getElementById('chart2'),
        config
    );
}


report1();
report2();