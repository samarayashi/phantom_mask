import _ from 'lodash';
import moment from 'moment';
import { logger } from '../lib/logger.js';

const DAY_MAPPING = {
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Thur': 4,
    'Fri': 5,
    'Sat': 6,
    'Sun': 7
};

let separateDaysAndTimes = (period) => {
    // 使用正則表達式分割星期和時間
    let matches = period.match(/^(.+?)\s+([\d:]+)\s*-\s*([\d:]+)$/);
    if (!matches) {
        throw new Error(`Invalid period format: ${period}`);
    }
    
    let [, daysStr, openTime, closeTime] = matches;
    return { daysStr, openTime, closeTime };
}

let parseDays = (daysStr) => {

    let daysArray = [];

    // 多個個別星期部分
    if (daysStr.includes(',')) {
        daysArray = daysStr.split(/[,\s]+/).map(d => DAY_MAPPING[d]);
    } 
    // 處理連續星期
    else if (daysStr.includes('-')) {
        let days = daysStr.split(/[-\s]+/).filter(d => d in DAY_MAPPING);
        if (days.length != 2) {
            throw new Error(`Invalid continuous days format: ${daysStr}`);
        }
        let [startDay, endDay] = days;
        let startDayNum = DAY_MAPPING[startDay];
        let endDayNum = DAY_MAPPING[endDay];
        for (let i = startDayNum; i <= endDayNum; i++) {
            daysArray.push(i);
        }
    } else {
        // 單一星期
        let day = daysStr.trim();
        daysArray.push(DAY_MAPPING[day]);
    }

    return daysArray;
} 

let parseOpeningHours = (openingHours) => {
    try {
        let result = [];
        let cleanHours = openingHours.trim();
        
        // 分割多個時段
        let periods = cleanHours.split('/').map(p => p.trim());
        
        for (let period of periods) {
            let { daysStr, openTime, closeTime } = separateDaysAndTimes(period);
            let daysArray = parseDays(daysStr);

            // 檢查是否為跨日營業
            let isCrossDay = moment(closeTime, 'HH:mm').isBefore(moment(openTime, 'HH:mm'));
            
            // 為每個營業日生成記錄
            for (let dayNum of daysArray) {
                if (isCrossDay) {
                    // 當天的記錄 (開始時間到午夜)
                    result.push({
                        day_of_week: dayNum,
                        open_time: openTime,
                        close_time: '23:59:59',
                        is_open: true
                    });
                    
                    // 次日的記錄 (午夜到結束時間)
                    let nextDay = (dayNum + 1) % 7;
                    result.push({
                        day_of_week: nextDay,
                        open_time: '00:00:00',
                        close_time: closeTime,
                        is_open: true
                    });
                } else {
                    // 一般營業時間記錄
                    result.push({
                        day_of_week: dayNum,
                        open_time: openTime,
                        close_time: closeTime,
                        is_open: true
                    });
                }
            }
        }
        
        return result;
    } catch (error) {
        logger.error('Error parsing opening hours', { 
            openingHours, 
            error: error.message 
        });
        throw error;
    }
};

export { parseOpeningHours };
