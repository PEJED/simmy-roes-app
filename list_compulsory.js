import { courses } from './src/data/courses.ts';

const flowStats = {};

courses.forEach(c => {
    if (!c.flow_code) return;
    if (!flowStats[c.flow_code]) {
        flowStats[c.flow_code] = { compulsory: 0, total: 0, compulsory_ids: [] };
    }
    flowStats[c.flow_code].total++;
    if (c.is_flow_compulsory) {
        flowStats[c.flow_code].compulsory++;
        flowStats[c.flow_code].compulsory_ids.push(c.id);
    }
});

console.log(JSON.stringify(flowStats, null, 2));
