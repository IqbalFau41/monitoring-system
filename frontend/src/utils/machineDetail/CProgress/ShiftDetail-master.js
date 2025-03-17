import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CProgress, CProgressStacked } from '@coreui/react'

const ShiftDetail = ({ shifts }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Define the start time for all shifts (07:00)
  const standardStartTime = 7 // 7 AM

  // Helper function to calculate time progress percentage for the current day
  const calculateDayProgress = () => {
    const now = currentTime
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()

    // If current time is before 7 AM, no progress should be shown
    if (currentHour < standardStartTime) {
      return 0
    }

    // Calculate elapsed time since 7 AM
    const hoursElapsed = currentHour - standardStartTime + currentMinutes / 60
    // Total day length (24 hours)
    const totalHours = 24

    // Return percentage of day completed since 7 AM
    return Math.min(100, (hoursElapsed / totalHours) * 100)
  }

  // Get current hour for display
  const getCurrentHour = () => {
    return currentTime.getHours()
  }

  // Get current minute for display
  const getCurrentMinute = () => {
    return currentTime.getMinutes()
  }

  // Check if shift has started based on current time
  const hasShiftStarted = (shiftStartHour) => {
    const currentHour = getCurrentHour()
    const currentMinute = getCurrentMinute()
    const startHour = parseInt(shiftStartHour.split(':')[0], 10)

    return currentHour > startHour || (currentHour === startHour && currentMinute >= 0)
  }

  // Determine if current time is within production hours (starting at 7 AM)
  const isWithinProductionHours = () => {
    const currentHour = currentTime.getHours()
    return currentHour >= standardStartTime
  }

  // Get color based on operation type
  const getOperationColor = (operationType) => {
    if (!operationType) return 'secondary'

    if (operationType.toUpperCase() === 'NORMAL OPERATION') {
      return 'success' // Green for normal operation
    } else if (operationType.toUpperCase() === 'CHOKOTEI') {
      return 'warning' // Yellow for chokotei
    } else if (operationType.toUpperCase() === 'WARNING') {
      return 'danger' // Red for warning
    } else {
      return 'info' // Blue for other operations
    }
  }

  // Function to determine if a time is within a shift's range
  const isTimeInShift = (hour, minutes, shiftStart, shiftEnd) => {
    const timeDecimal = hour + minutes / 60
    const startHour = parseInt(shiftStart.split(':')[0], 10)
    const endHour = parseInt(shiftEnd.split(':')[0], 10)

    // Handle shifts that cross midnight
    if (endHour < startHour) {
      return timeDecimal >= startHour || timeDecimal < endHour
    } else {
      return timeDecimal >= startHour && timeDecimal < endHour
    }
  }

  // Function to find the latest data point before the shift starts
  const findLatestDataBeforeShift = (allData, shiftStartHour) => {
    if (!allData || allData.length === 0) return null

    // Convert shift start to decimal hours
    const shiftStart = parseInt(shiftStartHour.split(':')[0], 10)

    // Sort all data by timestamp (ascending)
    const sortedData = [...allData].sort(
      (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
    )

    // Find the latest record before shift start
    let latestBeforeShift = null

    for (const record of sortedData) {
      const recordTime = new Date(record.CreatedAt)

      // Skip records with timestamps in the future
      if (recordTime > currentTime) continue

      const recordHour = recordTime.getHours()
      const recordMinute = recordTime.getMinutes()
      const recordDecimalTime = recordHour + recordMinute / 60

      // If this record is after shift start, stop looking
      if (recordHour >= shiftStart && recordHour < (shiftStart === 23 ? 0 : shiftStart + 1)) {
        break
      }

      latestBeforeShift = record
    }

    return latestBeforeShift
  }

  // Function to calculate hourly production values
  const calculateHourlyProduction = (data, shiftHours) => {
    if (!data || data.length === 0) return Array(shiftHours.length).fill(0)

    // Sort data by timestamp and filter out future data
    const sortedData = [...data]
      .filter((record) => new Date(record.CreatedAt) <= currentTime)
      .sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime())

    // Initialize hourly counters
    const hourlyProduction = Array(shiftHours.length).fill(0)

    // Extract hour values from shift hours
    const hours = shiftHours.map((timeStr) => parseInt(timeStr.split(':')[0], 10))

    // Track last hour's counter value to calculate increments
    let lastCounter = 0
    let lastHourIndex = -1

    sortedData.forEach((record) => {
      if (!record.CreatedAt || record.MACHINE_COUNTER === undefined) return

      const recordTime = new Date(record.CreatedAt)
      const recordHour = recordTime.getHours()

      // Find which hour bucket this record belongs to
      // A record at 7:30 contributes to the 8:00 counter (next hour)
      let hourIndex = -1
      for (let i = 0; i < hours.length; i++) {
        // For the last hour in the array, we include all records up to that hour
        if (i === hours.length - 1) {
          if (recordHour < hours[0] && recordHour >= hours[i]) {
            hourIndex = i
            break
          }
        }
        // For other hours, we check if the record falls between this hour and the next
        else if (i < hours.length - 1) {
          const nextHour = hours[i + 1]
          if (
            (recordHour >= hours[i] && recordHour < nextHour) ||
            (nextHour < hours[i] && (recordHour >= hours[i] || recordHour < nextHour))
          ) {
            hourIndex = i + 1 // Contributes to the next hour's counter
            break
          }
        }
      }

      if (hourIndex === -1) return // Record doesn't fall within shift hours

      // If this is the first record or a record from a new hour
      if (lastHourIndex === -1) {
        lastCounter = record.MACHINE_COUNTER
        lastHourIndex = hourIndex
      }
      // If this record belongs to the same hour bucket as the last one, update the counter
      else if (hourIndex === lastHourIndex) {
        // Update to the highest counter value in this hour
        lastCounter = Math.max(lastCounter, record.MACHINE_COUNTER)
      }
      // If this record belongs to a new hour bucket
      else {
        // Calculate increment for the previous hour
        hourlyProduction[lastHourIndex] = lastCounter

        // If there's a gap between the hour buckets, distribute zero values
        for (let i = lastHourIndex + 1; i < hourIndex; i++) {
          hourlyProduction[i] = 0
        }

        // For the current hour, start with the difference from the last hour
        lastCounter = record.MACHINE_COUNTER - lastCounter
        lastHourIndex = hourIndex
      }

      // Always update the current hour's production with at least the current increment
      hourlyProduction[hourIndex] = Math.max(hourlyProduction[hourIndex], lastCounter)
    })

    return hourlyProduction
  }

  // Function to get all data points across all shifts
  const getAllData = (shifts) => {
    let allData = []
    shifts.forEach((shift) => {
      if (shift.data && shift.data.length > 0) {
        allData = [...allData, ...shift.data]
      }
    })
    return allData
  }

  // Get all data across shifts
  const allShiftData = getAllData(shifts)

  return (
    <>
      <h2>Detail Production</h2>
      {shifts.map((shift, index) => {
        // Get shift hours - ensure we're using the correct hours as defined in the data
        const shiftHours = shift.hours || [
          '07:00',
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
        ]

        // Parse shift start and end hours
        const shiftStartHour = shiftHours[0]
        const shiftEndHour = shiftHours[shiftHours.length - 1]

        const startHourNum = parseInt(shiftStartHour.split(':')[0], 10)
        const endHourNum = parseInt(shiftEndHour.split(':')[0], 10)

        // Check if this shift has started yet
        const shiftHasStarted = hasShiftStarted(shiftStartHour)

        // If shift hasn't started yet, don't render it
        if (!shiftHasStarted) {
          return null
        }

        // Determine if current time falls within this shift
        const currentHour = getCurrentHour()
        const currentMinute = getCurrentMinute()
        const isActiveShift = isTimeInShift(
          currentHour,
          currentMinute,
          shiftStartHour,
          shiftEndHour,
        )

        // Find the latest data before this shift starts
        const latestBeforeShift = findLatestDataBeforeShift(allShiftData, shiftStartHour)

        // Calculate hourly production values
        const hourlyProduction = calculateHourlyProduction(shift.data, shiftHours)

        // Create status timeline segments for continuous visualization
        let statusSegments = []

        if (shift.data && shift.data.length > 0) {
          // Sort data by timestamp and filter out future data
          const sortedData = [...shift.data]
            .filter((record) => new Date(record.CreatedAt) <= currentTime)
            .sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime())

          // Find relevant records for this shift
          const shiftRecords = sortedData.filter((record) => {
            const recordTime = new Date(record.CreatedAt)
            const recordHour = recordTime.getHours()
            const recordMinute = recordTime.getMinutes()

            return isTimeInShift(recordHour, recordMinute, shiftStartHour, shiftEndHour)
          })

          // Create a combined data array that might include the data point from before shift start
          let combinedRecords = [...shiftRecords]

          // If we have the last record before shift and we have shift records
          if (latestBeforeShift && shiftRecords.length > 0) {
            // Check if there's a gap between shift start and first record in shift
            const firstShiftRecord = shiftRecords[0]
            const firstRecordTime = new Date(firstShiftRecord.CreatedAt)
            const shiftStartTime = new Date(firstRecordTime)

            // Set to shift start time
            shiftStartTime.setHours(startHourNum)
            shiftStartTime.setMinutes(0)
            shiftStartTime.setSeconds(0)

            // If the first record is after shift start time, fill gap with the latest before shift
            if (firstRecordTime > shiftStartTime) {
              // Create a copy of the latest before shift record but with shift start time
              const fillerRecord = {
                ...latestBeforeShift,
                CreatedAt: shiftStartTime.toISOString(),
              }

              // Insert at the beginning
              combinedRecords = [fillerRecord, ...shiftRecords]
            }
          }
          // If we have the last record before shift but no shift records, and it's active shift
          else if (latestBeforeShift && shiftRecords.length === 0 && isActiveShift) {
            // Create a record with shift start time
            const shiftStartTime = new Date()
            shiftStartTime.setHours(startHourNum)
            shiftStartTime.setMinutes(0)
            shiftStartTime.setSeconds(0)

            const fillerRecord = {
              ...latestBeforeShift,
              CreatedAt: shiftStartTime.toISOString(),
            }

            combinedRecords = [fillerRecord]
          }

          if (combinedRecords.length > 0) {
            // Get the timestamp of the last record
            const lastRecordTime = new Date(combinedRecords[combinedRecords.length - 1].CreatedAt)

            // Process data to create continuous segments
            for (let i = 0; i < combinedRecords.length; i++) {
              const record = combinedRecords[i]
              const recordTime = new Date(record.CreatedAt)
              const recordHour = recordTime.getHours()
              const recordMinute = recordTime.getMinutes()

              // Calculate where this time falls in our progress bar (as percentage)
              const timePosition = calculateTimePosition(
                recordHour,
                recordMinute,
                startHourNum,
                endHourNum,
                shiftHours.length,
              )

              // Calculate end position based on next record or current time
              let endPosition
              if (i < combinedRecords.length - 1) {
                // If there's a next record, use its time
                const nextRecord = combinedRecords[i + 1]
                const nextTime = new Date(nextRecord.CreatedAt)
                const nextHour = nextTime.getHours()
                const nextMinute = nextTime.getMinutes()

                endPosition = calculateTimePosition(
                  nextHour,
                  nextMinute,
                  startHourNum,
                  endHourNum,
                  shiftHours.length,
                )
              } else {
                // For the last record, extend up to current time if it's active shift
                if (isActiveShift) {
                  // Don't go beyond current time
                  const currentTimePosition = calculateTimePosition(
                    currentHour,
                    currentMinute,
                    startHourNum,
                    endHourNum,
                    shiftHours.length,
                  )

                  endPosition = currentTimePosition
                } else {
                  // For completed shifts, extend to the end of the shift
                  // But not beyond current time if current time is within this shift
                  const shiftEndPosition = 100
                  const currentTimePosition = calculateTimePosition(
                    currentHour,
                    currentMinute,
                    startHourNum,
                    endHourNum,
                    shiftHours.length,
                  )

                  // If current time is within this shift's hours
                  if (isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)) {
                    endPosition = currentTimePosition
                  } else {
                    endPosition = shiftEndPosition
                  }
                }
              }

              // Add segment to our timeline (only if it has width)
              const width = endPosition - timePosition
              if (width > 0) {
                statusSegments.push({
                  start: timePosition,
                  end: endPosition,
                  width: width,
                  operationType: record.OPERATION_NAME || '',
                  counter: record.MACHINE_COUNTER || 0,
                  color: getOperationColor(record.OPERATION_NAME),
                })
              }
            }

            // Calculate the total width of all segments
            const totalWidth = statusSegments.reduce((sum, segment) => sum + segment.width, 0)

            // If we haven't reached 100%, add empty space, but only up to current time for active shifts
            if (totalWidth < 100) {
              if (isActiveShift) {
                const currentTimePosition = calculateTimePosition(
                  currentHour,
                  currentMinute,
                  startHourNum,
                  endHourNum,
                  shiftHours.length,
                )

                // Only add empty space up to current time position if it's greater than total width
                if (currentTimePosition > totalWidth) {
                  statusSegments.push({
                    start: totalWidth,
                    end: currentTimePosition,
                    width: currentTimePosition - totalWidth,
                    operationType:
                      statusSegments.length > 0
                        ? statusSegments[statusSegments.length - 1].operationType
                        : '',
                    counter: 0,
                    color:
                      statusSegments.length > 0
                        ? statusSegments[statusSegments.length - 1].color
                        : 'secondary',
                  })
                }
              } else {
                // For inactive shifts, fill to the end with the last known status
                // But not beyond current time if the shift hasn't completed yet
                let endPosition = 100

                // If current time is within this shift's hours
                if (isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)) {
                  const currentTimePosition = calculateTimePosition(
                    currentHour,
                    currentMinute,
                    startHourNum,
                    endHourNum,
                    shiftHours.length,
                  )
                  endPosition = currentTimePosition
                }

                statusSegments.push({
                  start: totalWidth,
                  end: endPosition,
                  width: endPosition - totalWidth,
                  operationType:
                    statusSegments.length > 0
                      ? statusSegments[statusSegments.length - 1].operationType
                      : '',
                  counter: 0,
                  color:
                    statusSegments.length > 0
                      ? statusSegments[statusSegments.length - 1].color
                      : 'secondary',
                })
              }
            }
          } else {
            // No records in this shift but we have data from before shift
            if (latestBeforeShift) {
              // Calculate the current time position
              const currentTimePosition = calculateTimePosition(
                currentHour,
                currentMinute,
                startHourNum,
                endHourNum,
                shiftHours.length,
              )

              // Fill from shift start to current time (or shift end if completed)
              const endPosition = isActiveShift
                ? currentTimePosition
                : isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)
                  ? currentTimePosition
                  : 100

              // Only create a segment if there's width
              if (endPosition > 0) {
                statusSegments.push({
                  start: 0,
                  end: endPosition,
                  width: endPosition,
                  operationType: latestBeforeShift.OPERATION_NAME || '',
                  counter: latestBeforeShift.MACHINE_COUNTER || 0,
                  color: getOperationColor(latestBeforeShift.OPERATION_NAME),
                })
              }

              // If we haven't reached the end of the shift and it's not an active shift
              if (endPosition < 100 && !isActiveShift) {
                statusSegments.push({
                  start: endPosition,
                  end: 100,
                  width: 100 - endPosition,
                  operationType: '',
                  counter: 0,
                  color: 'secondary',
                })
              }
            } else {
              // Calculate the current time position for display limit
              const currentTimePosition =
                isActiveShift ||
                isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)
                  ? calculateTimePosition(
                      currentHour,
                      currentMinute,
                      startHourNum,
                      endHourNum,
                      shiftHours.length,
                    )
                  : 100

              // Completely empty shift - create one segment indicating signal loss
              statusSegments.push({
                start: 0,
                end: currentTimePosition,
                width: currentTimePosition,
                operationType: 'SIGNAL LOSS',
                counter: 0,
                color: 'danger', // Using red to indicate signal loss
              })

              // If we haven't reached the end and it's not active
              if (currentTimePosition < 100 && !isActiveShift) {
                statusSegments.push({
                  start: currentTimePosition,
                  end: 100,
                  width: 100 - currentTimePosition,
                  operationType: '',
                  counter: 0,
                  color: 'secondary',
                })
              }
            }
          }
        } else {
          // No data for this shift but we have data from before shift
          if (latestBeforeShift) {
            // Calculate the current time position
            const currentTimePosition = calculateTimePosition(
              currentHour,
              currentMinute,
              startHourNum,
              endHourNum,
              shiftHours.length,
            )

            // Fill from shift start to current time (or shift end if completed)
            const endPosition = isActiveShift
              ? currentTimePosition
              : isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)
                ? currentTimePosition
                : 100

            // Only create a segment if there's width
            if (endPosition > 0) {
              statusSegments.push({
                start: 0,
                end: endPosition,
                width: endPosition,
                operationType: latestBeforeShift.OPERATION_NAME || '',
                counter: latestBeforeShift.MACHINE_COUNTER || 0,
                color: getOperationColor(latestBeforeShift.OPERATION_NAME),
              })
            }

            // If we haven't reached the end of the shift and it's not an active shift
            if (endPosition < 100 && !isActiveShift) {
              statusSegments.push({
                start: endPosition,
                end: 100,
                width: 100 - endPosition,
                operationType: '',
                counter: 0,
                color: 'secondary',
              })
            }
          } else {
            // Calculate the current time position for display limit
            const currentTimePosition =
              isActiveShift ||
              isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)
                ? calculateTimePosition(
                    currentHour,
                    currentMinute,
                    startHourNum,
                    endHourNum,
                    shiftHours.length,
                  )
                : 100

            // Completely empty shift - create one segment indicating signal loss
            statusSegments.push({
              start: 0,
              end: currentTimePosition,
              width: currentTimePosition,
              operationType: 'SIGNAL LOSS',
              counter: 0,
              color: 'danger', // Using red to indicate signal loss
            })

            // If we haven't reached the end and it's not active
            if (currentTimePosition < 100 && !isActiveShift) {
              statusSegments.push({
                start: currentTimePosition,
                end: 100,
                width: 100 - currentTimePosition,
                operationType: '',
                counter: 0,
                color: 'secondary',
              })
            }
          }
        }

        return (
          <CCol md={12} key={index}>
            <CCard className="mb-3">
              <CCardHeader className="text-body">
                <strong>{shift.name}</strong>
                {isActiveShift && <span className="badge bg-success ms-2">Active</span>}
              </CCardHeader>
              <CCardBody className="p-4">
                <div className="grid-container">
                  {shiftHours.map((hour, hourIndex) => {
                    const position = `${(100 * hourIndex) / (shiftHours.length - 1)}%`
                    return (
                      <React.Fragment key={hourIndex}>
                        <span className="time-text" style={{ top: '0', left: position }}>
                          {hour}
                        </span>
                        <div className="grid-line" style={{ left: position }} />
                        <span className="time-text" style={{ bottom: '0', left: position }}>
                          {hourlyProduction[hourIndex] || 0}
                        </span>
                      </React.Fragment>
                    )
                  })}

                  <div className="progress-container">
                    <CProgressStacked className="progress-stacked">
                      {/* Render status segments as continuous timeline */}
                      {statusSegments.map((segment, idx) => (
                        <CProgress key={idx} color={segment.color} value={segment.width} />
                      ))}

                      {/* Time progress indicator as a separate overlay */}
                      {isWithinProductionHours() && isActiveShift && (
                        <div
                          className="time-progress-indicator"
                          style={{
                            left: `${calculateCurrentTimePosition(currentHour, currentMinute, startHourNum, endHourNum, shiftHours.length)}%`,
                            position: 'absolute',
                            height: '100%',
                            width: '2px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                            zIndex: 10,
                          }}
                        />
                      )}
                    </CProgressStacked>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        )
      })}
    </>
  )
}

// Helper function to calculate position on timeline for a given time
function calculateTimePosition(hour, minute, shiftStartHour, shiftEndHour, totalHours) {
  // Convert hour and minute to decimal hours
  const timeDecimal = hour + minute / 60

  // Handle shifts that cross midnight
  let hoursPassed
  if (shiftEndHour < shiftStartHour) {
    // Shift crosses midnight
    if (timeDecimal >= shiftStartHour) {
      // Time is after shift start but before midnight
      hoursPassed = timeDecimal - shiftStartHour
    } else {
      // Time is after midnight but before shift end
      hoursPassed = 24 - shiftStartHour + timeDecimal
    }
  } else {
    // Regular shift within same day
    hoursPassed = timeDecimal - shiftStartHour
  }

  // Calculate shift length in hours
  const shiftLength =
    shiftEndHour < shiftStartHour
      ? 24 - shiftStartHour + shiftEndHour
      : shiftEndHour - shiftStartHour

  // Calculate position as percentage of shift length
  return Math.min(100, Math.max(0, (hoursPassed / shiftLength) * 100))
}

// Helper function to calculate current time position for the active shift
function calculateCurrentTimePosition(hour, minute, shiftStartHour, shiftEndHour, totalHours) {
  return calculateTimePosition(hour, minute, shiftStartHour, shiftEndHour, totalHours)
}

export default ShiftDetail
