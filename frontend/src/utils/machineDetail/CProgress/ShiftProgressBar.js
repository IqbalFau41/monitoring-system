import React from 'react'
import { CProgress, CProgressStacked } from '@coreui/react'
import { calculateTimePosition, calculateCurrentTimePosition, isTimeInShift } from './TimeUtils'
import { getOperationColor } from './ShiftCalculations'

const ShiftProgressBar = ({
  shift,
  shiftHours,
  startHourNum,
  endHourNum,
  latestBeforeShift,
  isActiveShift,
  currentTime,
  hourlyProduction,
  isWithinProductionHours,
}) => {
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const shiftStartHour = shiftHours[0]
  const shiftEndHour = shiftHours[shiftHours.length - 1]

  // Create status timeline segments for continuous visualization
  const createStatusSegments = () => {
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
        // Handle no records in this shift but we have data from before shift
        handleNoShiftRecords(statusSegments)
      }
    } else {
      // Handle no data for this shift
      handleNoShiftData(statusSegments)
    }

    return statusSegments
  }

  // Handle the case when there are no records in this shift but we have data from before shift
  const handleNoShiftRecords = (statusSegments) => {
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
        isActiveShift || isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)
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

  // Handle the case when there's no data for this shift
  const handleNoShiftData = (statusSegments) => {
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
        isActiveShift || isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)
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

  // Get the status segments
  const statusSegments = createStatusSegments()

  return (
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
          {isWithinProductionHours && isActiveShift && (
            <div
              className="time-progress-indicator"
              style={{
                left: `${calculateCurrentTimePosition(
                  currentHour,
                  currentMinute,
                  startHourNum,
                  endHourNum,
                  shiftHours.length,
                )}%`,
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
  )
}

export default ShiftProgressBar
