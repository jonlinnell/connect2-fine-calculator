import React, { useCallback, useState, useReducer, useEffect } from 'react';
import parse from 'csv-parse';
import styled from 'styled-components';
import stringify from 'csv-stringify';
import moment from 'moment-business-days';
import xxh from 'xxhashjs';

import fines from '../misc/fines.json';
import { c2Instance } from '../misc/settings.json';

if (!c2Instance) throw new Error('`c2Instance` is not defined in settings.json.');

moment.locale('en-GB');

const tableContainerStyles = {
  width: '100%',
  overflow: 'scroll',
  padding: '1rem',
};

const UploadFileInput = styled.input`
  margin-left: 32px;
`;

const UploadFileLabel = styled.label`
  background-color: #eaeaea;
  padding: 6px;
  border-radius: 3px;
  font-size: 1.1rem;
  display: inline-block;
`;

const InlineItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const formatDate = date => moment(date).format('DD/MM/YYYY HH:mm');

const Calculator = () => {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [csvReport, setCsvReport] = useState();

  const [checked, dispatchChecked] = useReducer((state, action) => {
    if (action.type === 'ADD') {
      return [...new Set(state.concat(action.payload))];
    }

    if (action.type === 'REMOVE') {
      return state.filter(row => row !== action.payload);
    }

    if (action.type === 'CLEAR') {
      return [];
    }

    return state;
  }, []);

  const selectAll = () =>
    dispatchChecked({ type: 'ADD', payload: overdueLoans.map(loan => loan.id) });

  const processOverdueRecords = useCallback(records => {
    setOverdueLoans(
      records.map(record => {
        const dailyFine =
          fines.find(
            fine => fine.resource === record['Parent resource'] || fine.resource === record.Resource
          ).amount || 0;

        return {
          id: xxh.h32(`${record['Ref no']}-${record.resourceBarcode}`, 0xbeefbabe).toString(16),
          daysOverdue: moment(record['End date']).businessDiff(moment(record['Checked in'])),
          dailyFine,
          ...record,
        };
      })
    );
  }, []);

  const generateCSVOutput = useCallback(() => {
    stringify(
      overdueLoans
        .filter(loan => checked.includes(loan.id))
        .map(loan => ({
          studentName: `${loan['First name']} ${loan.Surname}`,
          studentNumber: loan.Barcode,
          amount: loan.daysOverdue * loan.dailyFine,
          bookingRef: loan['Ref no'],
          description: `Fine for late return of equipment (${loan.daysOverdue} day${
            loan.daysOverdue > 1 ? 's' : ''
          } overdue). Booking ref: ${loan['Ref no']}`,
        })),
      {
        columns: [
          { key: 'studentName', header: 'Student name' },
          { key: 'studentNumber', header: 'Student number' },
          { key: 'amount', header: 'Amount' },
          { key: 'bookingRef', header: 'Booking reference' },
          { key: 'description', header: 'Description' },
        ],
        header: true,
      },
      (err, output) => {
        if (err) throw new Error(err);

        setCsvReport(output);
      }
    );
  }, [checked]);

  const handleFile = useCallback(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContents = reader.result.replace('Barcode', 'resourceBarcode');

      parse(
        fileContents,
        {
          skipEmptyLines: true,
          delimiter: '\t',
          cast: true,
          columns: true,
        },
        (err, output) => {
          if (err) throw new Error(err);

          const overdue = output
            .filter(row => moment(row['Checked in']).isAfter(moment(row['End date']))) // overdue loans only
            .filter(row => /p|u/.test(row['SAML Field (Type)'])) // PGTs and UGs only
            .filter(row => moment(row['End date']).businessDiff(moment(row['Checked in'])) > 0); // same-day grace period

          setTotalRecords(output.length);
          processOverdueRecords(overdue);
        }
      );
    };

    reader.readAsText(file);
  }, []);

  const handleCheckboxClick = id => {
    if (checked.includes(id)) {
      dispatchChecked({ type: 'REMOVE', payload: id });
    } else {
      dispatchChecked({ type: 'ADD', payload: id });
    }
  };

  const handleMasterCheckboxClick = () => {
    if (checked.length === overdueLoans.length) {
      dispatchChecked({ type: 'CLEAR' });
    } else {
      selectAll();
    }
  };

  useEffect(generateCSVOutput, [checked]);

  return (
    <div style={{ textAlign: 'center' }}>
      <UploadFileLabel htmlFor="file">
        Upload a CSV report from Connect2 below to begin.
        <UploadFileInput type="file" name="file" onChange={e => handleFile(e.target.files[0])} />
      </UploadFileLabel>
      <InlineItems>
        {overdueLoans.length ? (
          <p>
            {overdueLoans.length} of {totalRecords} items overdue.
          </p>
        ) : null}
        {csvReport && checked.length > 0 ? (
          <a
            href={`data:application/octet-stream;charset=utf-8,${encodeURIComponent(csvReport)}`}
            download={`C2 Fines ${moment().format('YYYY-MM-DD HH-mm')}.csv`}
            style={{ marginLeft: '32px' }}
          >
            Download report for {checked.length} selected entries
          </a>
        ) : null}
      </InlineItems>
      <div style={tableContainerStyles}>
        <table
          className="pure-table pure-table-striped"
          style={{ width: '100%', textAlign: 'left' }}
        >
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={overdueLoans.length > 0 ? checked.length >= overdueLoans.length : false}
                  onChange={handleMasterCheckboxClick}
                />
              </th>
              <th>Booking reference</th>
              <th>Name</th>
              <th>Student number</th>
              <th>Email</th>
              <th>Resource</th>
              <th style={{ whiteSpace: 'nowrap' }}>Due date</th>
              <th style={{ whiteSpace: 'nowrap' }}>Check in date</th>
              <th>Days overdue</th>
              <th>Daily rate</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {overdueLoans.map(loan => (
              <tr key={loan.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={checked.includes(loan.id)}
                    onChange={() => handleCheckboxClick(loan.id)}
                  />
                </td>
                <td>
                  <a
                    href={`${c2Instance}bookings/view.aspx?id=${loan['Ref no'].slice(-6)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {loan['Ref no']}
                  </a>
                </td>
                <td>
                  {loan['First name']} {loan.Surname}
                </td>
                <td>{loan.Barcode}</td>
                <td>{loan.Email}</td>
                <td>
                  {loan.resourceBarcode ? <span>({loan.resourceBarcode})&nbsp;</span> : null}
                  {loan.Resource}
                </td>
                <td>{formatDate(loan['End date'])}</td>
                <td>{formatDate(loan['Checked in'])}</td>
                <td>{loan.daysOverdue}</td>
                <td>{loan.dailyFine.toFixed(2)}</td>
                <td>{(loan.dailyFine * loan.daysOverdue).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Calculator;
