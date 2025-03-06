// backend/utils/machineDetailUtils.js

/**
 * Groups machine data by day for weekly and monthly chart views
 * @param {Array} data - Array of machine records
 * @returns {Object} Object containing weekly and monthly datasets
 */
const prepareChartData = (data) => {
  // Get date ranges
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  // Initialize weekly data arrays
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyProduction = Array(7).fill(0);
  const weeklyTarget = Array(7).fill(2000); // Example target

  // Initialize monthly data arrays (for last 30 days)
  const monthlyLabels = [];
  const monthlyProduction = [];
  const monthlyTarget = [];

  // Create date labels for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
    monthlyLabels.push(dateString);
    monthlyProduction.push(0);
    monthlyTarget.push(2000); // Example target
  }

  // Process data to populate chart datasets
  data.forEach((record) => {
    const recordDate = new Date(record.CreatedAt);

    // If record is within the last week
    if (recordDate >= oneWeekAgo) {
      const dayOfWeek = recordDate.getDay(); // 0 = Sunday, 6 = Saturday
      weeklyProduction[dayOfWeek] += record.MACHINE_COUNTER || 0;
    }

    // If record is within the last month
    if (recordDate >= oneMonthAgo) {
      const dayOffset = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
      if (dayOffset >= 0 && dayOffset < 31) {
        monthlyProduction[30 - dayOffset] += record.MACHINE_COUNTER || 0;
      }
    }
  });

  return {
    weekly: {
      labels: weekDays,
      datasets: [
        {
          label: "Production",
          data: weeklyProduction,
          borderColor: "rgba(32, 168, 216, 0.8)",
          backgroundColor: "rgba(32, 168, 216, 0.2)",
        },
        {
          label: "Target",
          data: weeklyTarget,
          borderColor: "rgba(77, 189, 116, 0.8)",
          backgroundColor: "transparent",
          borderDash: [5, 5],
        },
      ],
    },
    monthly: {
      labels: monthlyLabels,
      datasets: [
        {
          label: "Production",
          data: monthlyProduction,
          borderColor: "rgba(32, 168, 216, 0.8)",
          backgroundColor: "rgba(32, 168, 216, 0.2)",
        },
        {
          label: "Target",
          data: monthlyTarget,
          borderColor: "rgba(77, 189, 116, 0.8)",
          backgroundColor: "transparent",
          borderDash: [5, 5],
        },
      ],
    },
  };
};

/**
 * Processes machine data to generate shift information
 * @param {Array} data - Array of machine records
 * @returns {Array} Array of shift objects with processed data
 */
const processShiftData = (data) => {
  // Define shifts
  const shifts = [
    { name: "Shift 1 (06:00 - 14:00)", data: [], hours: [] },
    { name: "Shift 2 (14:00 - 22:00)", data: [], hours: [] },
    { name: "Shift 3 (22:00 - 06:00)", data: [], hours: [] },
  ];

  // Initialize hours for each shift
  shifts.forEach((shift) => {
    for (let i = 0; i < 9; i++) {
      shift.hours.push(`${i}h`);
    }

    // Initialize progress arrays
    shift.progressValues = Array(8).fill(0);
    shift.progressValues2 = Array(8).fill(0);
    shift.progressValues3 = Array(8).fill(0);
  });

  // Group data by shift
  data.forEach((record) => {
    const recordDate = new Date(record.CreatedAt);
    const hour = recordDate.getHours();

    // Determine which shift this record belongs to
    let shiftIndex;
    if (hour >= 6 && hour < 14) {
      shiftIndex = 0;
    } else if (hour >= 14 && hour < 22) {
      shiftIndex = 1;
    } else {
      shiftIndex = 2;
    }

    // Add record to appropriate shift
    shifts[shiftIndex].data.push(record);

    // Update progress values
    // This is a simplified example - you would need to adapt based on your actual data structure
    const hourPosition = hour % 8;

    // Use the MACHINE_COUNTER or other relevant fields to update progress values
    if (record.OPERATION_NAME === "Normal Operation") {
      shifts[shiftIndex].progressValues[hourPosition] += 10;
    } else if (record.OPERATION_NAME === "Warning") {
      shifts[shiftIndex].progressValues2[hourPosition] += 10;
    } else {
      shifts[shiftIndex].progressValues3[hourPosition] += 10;
    }
  });

  return shifts;
};

module.exports = {
  prepareChartData,
  processShiftData,
};
