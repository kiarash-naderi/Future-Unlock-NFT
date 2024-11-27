// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utils {
    // Function to convert number of days to seconds
    function daysToSeconds(uint256 numDays) internal pure returns (uint256) {
        return numDays * 24 * 60 * 60;
    }

    // Function to extract date from timestamp (year, month, day)
    function toDate(uint256 timestamp) internal pure returns (uint256 year, uint256 month, uint256 day) {
        uint256 SECONDS_PER_DAY = 24 * 60 * 60;
        uint256 OFFSET1970 = 2440588;

        // Number of days since 1970/01/01
        uint256 daysSince1970 = timestamp / SECONDS_PER_DAY;
        uint256 julianDate = daysSince1970 + OFFSET1970;

        // Date conversion algorithm
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
