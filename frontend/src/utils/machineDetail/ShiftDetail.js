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

  // Function to calculate hourly production values
  const calculateHourlyProduction = (data, shiftHours) => {
    if (!data || data.length === 0) return Array(shiftHours.length).fill(0)

    // Sort data by timestamp
    const sortedData = [...data].sort(
      (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
    )

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

        // Determine if current time falls within this shift
        const currentHour = getCurrentHour()
        const currentMinute = currentTime.getMinutes()
        const isActiveShift = isTimeInShift(
          currentHour,
          currentMinute,
          shiftStartHour,
          shiftEndHour,
        )

        // Calculate hourly production values
        const hourlyProduction = calculateHourlyProduction(shift.data, shiftHours)

        // Create status timeline segments for continuous visualization
        let statusSegments = []

        if (shift.data && shift.data.length > 0) {
          // Sort data by timestamp
          const sortedData = [...shift.data].sort(
            (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
          )

          // Find relevant records for this shift
          const shiftRecords = sortedData.filter((record) => {
            const recordTime = new Date(record.CreatedAt)
            const recordHour = recordTime.getHours()
            const recordMinute = recordTime.getMinutes()

            return isTimeInShift(recordHour, recordMinute, shiftStartHour, shiftEndHour)
          })

          if (shiftRecords.length > 0) {
            // Get the timestamp of the last record
            const lastRecordTime = new Date(shiftRecords[shiftRecords.length - 1].CreatedAt)

            // Process data to create continuous segments
            for (let i = 0; i < shiftRecords.length; i++) {
              const record = shiftRecords[i]
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
              if (i < shiftRecords.length - 1) {
                // If there's a next record, use its time
                const nextRecord = shiftRecords[i + 1]
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
                // For the last record, extend only up to current time if it's active shift
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
                  // For completed shifts or inactive shifts, show up to last data point only
                  endPosition = calculateTimePosition(
                    lastRecordTime.getHours(),
                    lastRecordTime.getMinutes(),
                    startHourNum,
                    endHourNum,
                    shiftHours.length,
                  )
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
            if (totalWidth < 100 && isActiveShift) {
              const currentTimePosition = calculateTimePosition(
                currentHour,
                currentMinute,
                startHourNum,
                endHourNum,
                shiftHours.length,
              )

              // Add "empty" segment from last record to current time
              statusSegments.push({
                start: totalWidth,
                end: currentTimePosition,
                width: currentTimePosition - totalWidth,
                operationType: '',
                counter: 0,
                color: 'secondary',
              })
            }
          } else {
            // If no records in this shift, check if it's the active shift
            if (isActiveShift) {
              // For active shift with no data, show progress up to current time
              const currentTimePosition = calculateTimePosition(
                currentHour,
                currentMinute,
                startHourNum,
                endHourNum,
                shiftHours.length,
              )

              statusSegments.push({
                start: 0,
                end: currentTimePosition,
                width: currentTimePosition,
                operationType: '',
                counter: 0,
                color: 'secondary',
              })
            } else {
              // For inactive shifts with no data, leave them empty
              statusSegments.push({
                start: 0,
                end: 0,
                width: 0,
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

                      {/* Fill any remaining space if status segments don't add up to 100% */}
                      {statusSegments.length > 0 && (
                        <CProgress
                          color="secondary"
                          value={Math.max(
                            0,
                            100 - statusSegments.reduce((total, seg) => total + seg.width, 0),
                          )}
                        />
                      )}

                      {/* If no data, show empty progress bar */}
                      {statusSegments.length === 0 && <CProgress color="secondary" value={100} />}

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
