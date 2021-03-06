import { unitTestWrapper, assert, assertCell, createTempSheet, fillInTempSheet, deleteTempSheet } from './utils.test';
import { sixPackDataRow, completeDataRow } from '../src/types';
import calcFiatValuesFromFMV from '../src/gas/fmv';
import validate from '../src/validate';
import getLastRowWithDataPresent from '../src/last-row';

/**
 * test1 for function calcFiatValuesFromFMV(sheet)
 */
export default function test1FMV(): unitTestWrapper {
    return (): void => {
        const coinName = 'FMV_TEST1';
        const sheet = createTempSheet(coinName);
        const data: completeDataRow[] = [
            ['', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['2015-12-01', '', 1.00000000, 0, 0, 0, '', 0, 0, '', '1.111100', '0.992222', ''],
            ['2016-02-29', '', 1.00000000, 1, 0, 0, '', 0, 0, '', 'value known', '', ''],
            ['2016-03-01', '', 0, 0, 1.00000000, 5, '', 0, 0, '', 'value known', 'value known', ''],
            ['2018-02-28', '', 23.00000000, 0, 0, 0, '', 0, 0, '', 'price known', '', '34'],
            ['2020-04-01', '', 0, 0, 2.00000000, 0, '', 0, 0, '', '2.312002', '1.8222', ''],
            ['2020-04-02', '', 0, 0, 20.00000000, 0, '', 0, 0, '', '=0.0003561*7088.25', '=0.0003561*6595.92', ''],
            ['2020-05-31', '', 26.92000000, 0, 0, 0, '', 0, 0, '', '=0.0069319*9700.34/C9', '=0.0069319*9432.3/C9', '']
        ];
        const TestRun = function (round): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                // clone the data array, and trim down to data needed for validation
                const validationData = [...data];
                validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
                validationData.forEach(row => row.splice(6, 4));

                assert((validate(validationData as unknown as sixPackDataRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = data.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);

                // clone the data array, and trim down to data needed for FMV calcs
                const acquiredCol = [...data as string[][]];
                acquiredCol.forEach((row, rowIdx) => { acquiredCol[rowIdx] = [...row]; });
                acquiredCol.forEach(row => row.splice(0, 2)); // remove leftmost date, category columns
                acquiredCol.forEach(row => row.splice(1, row.length - 2)); // remove all remaining columns to the right
                const disposedCol = [...data as string[][]];
                disposedCol.forEach((row, rowIdx) => { disposedCol[rowIdx] = [...row]; });
                disposedCol.forEach(row => row.splice(0, 4)); // remove leftmost date, category, inflow columns
                disposedCol.forEach(row => row.splice(1, row.length - 4)); // remove all remaining columns to the right
                const firstFMVcol = [...data as string[][]];
                firstFMVcol.forEach((row, rowIdx) => { firstFMVcol[rowIdx] = [...row]; });
                firstFMVcol.forEach(row => row.splice(0, 10)); // remove leftmost date, category, inflow, outflow, calculated and notes columns
                firstFMVcol.forEach(row => row.splice(1, row.length - 10)); // remove all remaining columns to the right
                calcFiatValuesFromFMV(null, data, acquiredCol, disposedCol, firstFMVcol, lastRow);
            } else if (sheet !== null) {
                // QUnit unit test
                assert((validate(sheet.getRange('A:F').getValues() as sixPackDataRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);
                const acquiredCol = sheet.getRange('C:C').getValues();
                const disposedCol = sheet.getRange('E:E').getValues();
                const firstFMVcol = sheet.getRange('K:K').getValues();
                calcFiatValuesFromFMV(sheet, null, acquiredCol, disposedCol, firstFMVcol, lastRow);
                // these assertions aren't checked locally becasue they require cell formula calcs to happen
                assertCell(sheet, data as string[][], 2, 3, '1.05', 'Test for Fiat Cost calculated from FMV data : Row 3 Fiat Cost : expected fiat cost calc from FMV average', 2);
                assertCell(sheet, data as string[][], 2, 12, '1.05', 'Test for FMV average formula inserted : Row 3 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 5, 3, '782.00', 'Test for Fiat Cost with known FMV price : Row 6 Fiat Cost : expected fiat cost calc from known FMV price', 2);
                assertCell(sheet, data as string[][], 6, 5, '4.13', 'Test for Fiat Received calculated from FMV data : Row 7 Fiat Received : expected fiat received calc from FMV average', 2);
                assertCell(sheet, data as string[][], 6, 12, '2.07', 'Test for FMV average formula inserted : Row 7 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 7, 5, '48.73', 'Test for Fiat Received calculated from FMV data : Row 8 Fiat Received : expected fiat received calc from FMV average derived from formulas', 2);
                assertCell(sheet, data as string[][], 7, 12, '2.44', 'Test for FMV average formula inserted : Row 8 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 8, 3, '66.31', 'Test for Fiat Cost calculated from FMV data : Row 9 Fiat Cost : expected fiat cost calc from FMV average derived from formulas', 2);
                assertCell(sheet, data as string[][], 8, 12, '2.46', 'Test for FMV average formula inserted : Row 9 Price : expected FMV calc averaged from supplied high/low prices', 2);
            }
            assertCell(sheet, data as string[][], 3, 3, '1.00', 'Test for Fiat Cost with no FMV data : Row 4 Fiat Cost : expected user supplied number (bolded)', 2);
            assertCell(sheet, data as string[][], 3, 11, 'value known', 'Test for FMV setinel value filled right : Row 4 Low : expected sentinel value copied from col J');
            assertCell(sheet, data as string[][], 3, 12, 'value known', 'Test for  FMV setinel value filled right : Row 4 Price : expected sentinel value copied from col J');
            assertCell(sheet, data as string[][], 4, 5, '5.00', 'Test for Fiat Received with no FMV data : Row 5 Fiat Received : expected user supplied number (bolded)', 2);
            assertCell(sheet, data as string[][], 4, 12, 'value known', 'Test for FMV setinel value filled right : Row 5 Price : expected sentinel value copied from col J');
            assertCell(sheet, data as string[][], 5, 11, 'price known', 'Test for FMV setinel value filled right : Row 6 Low : expected sentinel value copied from col J');
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);

        deleteTempSheet(sheet);
    };
}
