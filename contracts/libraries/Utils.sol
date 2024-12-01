// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utils {
    // تبدیل دقیقه به ثانیه
    function minutesToSeconds(uint256 lockMinutes) internal pure returns (uint256) {
        return lockMinutes * 60;
    }
    
    // تبدیل ساعت به ثانیه
    function hoursToSeconds(uint256 lockHours) internal pure returns (uint256) {
        return lockHours * 60 * 60;
    }
    
    // تبدیل روز به ثانیه
    function daysToSeconds(uint256 lockDays) internal pure returns (uint256) {
        return lockDays * 24 * 60 * 60;
    }
    
    // تبدیل ترکیبی از زمان‌ها به ثانیه
    function timeToSeconds(
        uint256 lockDays,
        uint256 lockHours,
        uint256 lockMinutes
    ) internal pure returns (uint256) {
        return daysToSeconds(lockDays) + 
               hoursToSeconds(lockHours) + 
               minutesToSeconds(lockMinutes);
    }
    
    // محاسبه زمان باقی‌مانده
    function getRemainingTime(uint256 unlockTime) internal view returns (
        uint256 remainingDays,
        uint256 remainingHours,
        uint256 remainingMinutes
    ) {
        require(unlockTime > block.timestamp, "Time already passed");
        
        uint256 remainingSeconds = unlockTime - block.timestamp;
        
        remainingDays = remainingSeconds / (24 * 60 * 60);
        remainingSeconds = remainingSeconds % (24 * 60 * 60);
        
        remainingHours = remainingSeconds / (60 * 60);
        remainingSeconds = remainingSeconds % (60 * 60);
        
        remainingMinutes = remainingSeconds / 60;
    }

    // استخراج تاریخ از timestamp
    function toDate(uint256 timestamp) internal pure returns (
        uint256 year,
        uint256 month,
        uint256 day
    ) {
        uint256 SECONDS_PER_DAY = 24 * 60 * 60;
        uint256 OFFSET1970 = 2440588;

        uint256 daysSince1970 = timestamp / SECONDS_PER_DAY;
        uint256 julianDate = daysSince1970 + OFFSET1970;

        uint256 l = julianDate + 68569;
        uint256 n = 4 * l / 146097;
        l = l - (146097 * n + 3) / 4;
        uint256 i = 4000 * (l + 1) / 1461001;
        l = l - 1461 * i / 4 + 31;
        uint256 j = 80 * l / 2447;
        uint256 k = l - 2447 * j / 80;
        l = j / 11;
        j = j + 2 - 12 * l;
        i = 100 * (n - 49) + i + l;

        year = i;
        month = j;
        day = k;
    }
}