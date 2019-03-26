import React, { useCallback, useState } from 'react';
import parse from 'csv-parse';
import moment from 'moment-business-days';

import fines from '../misc/fines.json';
import { c2Instance } from '../misc/settings.json';

if (!c2Instance) throw new Error('`c2Instance` is not defined in settings.json.');

moment.locale('en-GB');

const tableStyles = { maxHeight: '1000px', width: '90vw', overflow: 'scroll', margin: '1rem' };

const formatDate = date => moment(date).format('LLL');

const Calculator = () => {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const processOverdueRecords = useCallback(records => {
    setOverdueLoans(
      records.map(record => {
        const dailyFine =
          fines.find(
            fine => fine.resource === record['Parent resource'] || fine.resource === record.Resource
          ).amount || 0;

        return {
          daysOverdue: moment(record['End date']).businessDiff(moment(record['Checked in'])),
          dailyFine,
          ...record,
        };
      })
    );
  }, []);

  const handleFile = useCallback(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContents = reader.result.replace('Barcode', 'Resource Barcode');

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

  return (
    <div style={{ textAlign: 'center' }}>
      <input type="file" name="file" onChange={e => handleFile(e.target.files[0])} />
      {overdueLoans.length ? (
        <p>
          {overdueLoans.length} of {totalRecords} items overdue.
        </p>
      ) : null}
      <div style={tableStyles}>
        <table className="pure-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Booking reference</th>
              <th>Name</th>
              <th>Student number</th>
              <th>Email</th>
              <th>Resource</th>
              <th>Scheduled return date</th>
              <th>Check in date</th>
              <th>Days overdue</th>
              <th>Fine rate</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {overdueLoans.map(loan => (
              <tr key={`${loan['Ref no']}-${loan['Resource Barcode']}`}>
                <td>
                  <a
                    href={`${c2Instance}bookings/view.aspx?id=${loan[
                      'Ref no'
                    ].slice(-6)}`}
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
                  {loan.Barcode ? <span>({loan['Resource Barcode']})&nbsp;</span> : null}
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
