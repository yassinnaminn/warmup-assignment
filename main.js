const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let startParts = startTime.trim().toLowerCase().split(" ");
    let endParts = endTime.trim().toLowerCase().split(" ");

    let startTimeOnly = startParts[0];
    let startPeriod = startParts[1];
    let endTimeOnly = endParts[0];
    let endPeriod = endParts[1];

    let startSplit = startTimeOnly.split(":");
    let endSplit = endTimeOnly.split(":");

    let startHours = parseInt(startSplit[0]);
    let startMinutes = parseInt(startSplit[1]);
    let startSeconds = parseInt(startSplit[2]);

    let endHours = parseInt(endSplit[0]);
    let endMinutes = parseInt(endSplit[1]);
    let endSeconds = parseInt(endSplit[2]);

    if (startPeriod === "am" && startHours === 12) {
        startHours = 0;
    } else if (startPeriod === "pm" && startHours !== 12) {
        startHours += 12;
    }

    if (endPeriod === "am" && endHours === 12) {
        endHours = 0;
    } else if (endPeriod === "pm" && endHours !== 12) {
        endHours += 12;
    }

    let startTotalSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    let endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    let diff = endTotalSeconds - startTotalSeconds;

    let hours = Math.floor(diff / 3600);
    let minutes = Math.floor((diff % 3600) / 60);
    let seconds = diff % 60;

    return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    let startParts = startTime.trim().toLowerCase().split(" ");
    let endParts = endTime.trim().toLowerCase().split(" ");

    let startTimeOnly = startParts[0];
    let startPeriod = startParts[1];
    let endTimeOnly = endParts[0];
    let endPeriod = endParts[1];

    let startSplit = startTimeOnly.split(":");
    let endSplit = endTimeOnly.split(":");

    let startHours = parseInt(startSplit[0]);
    let startMinutes = parseInt(startSplit[1]);
    let startSeconds = parseInt(startSplit[2]);

    let endHours = parseInt(endSplit[0]);
    let endMinutes = parseInt(endSplit[1]);
    let endSeconds = parseInt(endSplit[2]);

    if (startPeriod === "am" && startHours === 12) {
        startHours = 0;
    } else if (startPeriod === "pm" && startHours !== 12) {
        startHours += 12;
    }

    if (endPeriod === "am" && endHours === 12) {
        endHours = 0;
    } else if (endPeriod === "pm" && endHours !== 12) {
        endHours += 12;
    }

    let startTotalSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    let endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    let deliveryStart = 8 * 3600;
    let deliveryEnd = 22 * 3600;

    let idleSeconds = 0;

    if (startTotalSeconds < deliveryStart) {
        idleSeconds += Math.min(endTotalSeconds, deliveryStart) - startTotalSeconds;
    }

    if (endTotalSeconds > deliveryEnd) {
        idleSeconds += endTotalSeconds - Math.max(startTotalSeconds, deliveryEnd);
    }

    let hours = Math.floor(idleSeconds / 3600);
    let minutes = Math.floor((idleSeconds % 3600) / 60);
    let seconds = idleSeconds % 60;

    return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let shiftSplit = shiftDuration.split(":");
    let idleSplit = idleTime.split(":");

    let shiftHours = parseInt(shiftSplit[0]);
    let shiftMinutes = parseInt(shiftSplit[1]);
    let shiftSeconds = parseInt(shiftSplit[2]);

    let idleHours = parseInt(idleSplit[0]);
    let idleMinutes = parseInt(idleSplit[1]);
    let idleSeconds = parseInt(idleSplit[2]);

    let shiftTotalSeconds = shiftHours * 3600 + shiftMinutes * 60 + shiftSeconds;
    let idleTotalSeconds = idleHours * 3600 + idleMinutes * 60 + idleSeconds;

    let activeSeconds = shiftTotalSeconds - idleTotalSeconds;

    let hours = Math.floor(activeSeconds / 3600);
    let minutes = Math.floor((activeSeconds % 3600) / 60);
    let seconds = activeSeconds % 60;

    return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    let activeSplit = activeTime.split(":");

    let activeHours = parseInt(activeSplit[0]);
    let activeMinutes = parseInt(activeSplit[1]);
    let activeSeconds = parseInt(activeSplit[2]);

    let activeTotalSeconds = activeHours * 3600 + activeMinutes * 60 + activeSeconds;

    let requiredSeconds;

    if (date >= "2025-04-10" && date <= "2025-04-30") {
        requiredSeconds = 6 * 3600;
    } else {
        requiredSeconds = 8 * 3600 + 24 * 60;
    }

    return activeTotalSeconds >= requiredSeconds;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    let fileContent = fs.readFileSync(textFile, "utf8").trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0] === shiftObj.driverID && parts[2] === shiftObj.date) {
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let quotaResult = metQuota(shiftObj.date, activeTime);

    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quotaResult,
        hasBonus: false
    };

    let newLine = newRecord.driverID + "," +
                  newRecord.driverName + "," +
                  newRecord.date + "," +
                  newRecord.startTime + "," +
                  newRecord.endTime + "," +
                  newRecord.shiftDuration + "," +
                  newRecord.idleTime + "," +
                  newRecord.activeTime + "," +
                  newRecord.metQuota + "," +
                  newRecord.hasBonus;

    let lastIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0] === shiftObj.driverID) {
            lastIndex = i;
        }
    }

    if (lastIndex === -1) {
        lines.push(newLine);
    } else {
        lines.splice(lastIndex + 1, 0, newLine);
    }

    fs.writeFileSync(textFile, lines.join("\n"));

    return newRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    let fileContent = fs.readFileSync(textFile, "utf8").trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0] === driverID && parts[2] === date) {
            parts[9] = String(newValue);
            lines[i] = parts.join(",");
            break;
        }
    }

    fs.writeFileSync(textFile, lines.join("\n"));
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    let fileContent = fs.readFileSync(textFile, "utf8").trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    let targetMonth = String(parseInt(month)).padStart(2, "0");
    let foundDriver = false;
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        let currentDriverID = parts[0].trim();
        let date = parts[2].trim();
        let hasBonus = parts[9].trim();

        if (currentDriverID === driverID) {
            foundDriver = true;
            let recordMonth = date.split("-")[1];

            if (recordMonth === targetMonth && hasBonus === "true") {
                count++;
            }
        }
    }

    if (!foundDriver) {
        return -1;
    }

    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    let fileContent = fs.readFileSync(textFile, "utf8").trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    let totalSeconds = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        let currentDriverID = parts[0];
        let date = parts[2];
        let activeTime = parts[7];

        let recordMonth = parseInt(date.split("-")[1]);

        if (currentDriverID === driverID && recordMonth === month) {
            let activeSplit = activeTime.split(":");
            let hours = parseInt(activeSplit[0]);
            let minutes = parseInt(activeSplit[1]);
            let seconds = parseInt(activeSplit[2]);

            totalSeconds += hours * 3600 + minutes * 60 + seconds;
        }
    }

    let totalHours = Math.floor(totalSeconds / 3600);
    let totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    let totalRemainingSeconds = totalSeconds % 60;

    return totalHours + ":" + String(totalMinutes).padStart(2, "0") + ":" + String(totalRemainingSeconds).padStart(2, "0");
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    let shiftContent = fs.readFileSync(textFile, "utf8").trim();
    let rateContent = fs.readFileSync(rateFile, "utf8").trim();

    let shiftLines = shiftContent === "" ? [] : shiftContent.split("\n");
    let rateLines = rateContent === "" ? [] : rateContent.split("\n");

    let dayOff = "";

    for (let i = 0; i < rateLines.length; i++) {
        let parts = rateLines[i].split(",");
        if (parts[0] === driverID) {
            dayOff = parts[1];
            break;
        }
    }

    let totalSeconds = 0;

    for (let i = 0; i < shiftLines.length; i++) {
        let parts = shiftLines[i].split(",");
        let currentDriverID = parts[0];
        let date = parts[2];

        if (currentDriverID !== driverID) {
            continue;
        }

        let recordMonth = parseInt(date.split("-")[1]);
        if (recordMonth !== month) {
            continue;
        }

        let dateParts = date.split("-");
        let year = parseInt(dateParts[0]);
        let monthNumber = parseInt(dateParts[1]);
        let day = parseInt(dateParts[2]);

        let currentDate = new Date(year, monthNumber - 1, day);
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dayName = days[currentDate.getDay()];

        if (dayName === dayOff) {
            continue;
        }

        if (date >= "2025-04-10" && date <= "2025-04-30") {
            totalSeconds += 6 * 3600;
        } else {
            totalSeconds += 8 * 3600 + 24 * 60;
        }
    }

    totalSeconds -= bonusCount * 2 * 3600;

    if (totalSeconds < 0) {
        totalSeconds = 0;
    }

    let totalHours = Math.floor(totalSeconds / 3600);
    let totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    let totalRemainingSeconds = totalSeconds % 60;

    return totalHours + ":" + String(totalMinutes).padStart(2, "0") + ":" + String(totalRemainingSeconds).padStart(2, "0");
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    let fileContent = fs.readFileSync(rateFile, "utf8").trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    let basePay = 0;
    let tier = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0] === driverID) {
            basePay = parseInt(parts[2]);
            tier = parseInt(parts[3]);
            break;
        }
    }

    let allowedMissingHours = 0;

    if (tier === 1) {
        allowedMissingHours = 50;
    } else if (tier === 2) {
        allowedMissingHours = 20;
    } else if (tier === 3) {
        allowedMissingHours = 10;
    } else if (tier === 4) {
        allowedMissingHours = 3;
    }

    let actualSplit = actualHours.split(":");
    let requiredSplit = requiredHours.split(":");

    let actualSeconds = parseInt(actualSplit[0]) * 3600 + parseInt(actualSplit[1]) * 60 + parseInt(actualSplit[2]);
    let requiredSeconds = parseInt(requiredSplit[0]) * 3600 + parseInt(requiredSplit[1]) * 60 + parseInt(requiredSplit[2]);

    if (actualSeconds >= requiredSeconds) {
        return basePay;
    }

    let missingSeconds = requiredSeconds - actualSeconds;
    missingSeconds -= allowedMissingHours * 3600;

    if (missingSeconds <= 0) {
        return basePay;
    }

    let billableMissingHours = Math.floor(missingSeconds / 3600);
    let deductionRatePerHour = Math.floor(basePay / 185);
    let salaryDeduction = billableMissingHours * deductionRatePerHour;

    return basePay - salaryDeduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};