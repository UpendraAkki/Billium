import React from 'react';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';
import Logo from '../Logo';

const Template3 = ({ data }) => {
  const { billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency, branding } = data;

  return (
    <BaseTemplate data={data}>
      <div 
        className="text-white p-12" 
        style={{ 
          backgroundColor: branding?.primaryColor || '#3b82f6',
          fontFamily: branding?.fontFamily || 'Inter'
        }}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <Logo yourCompany={yourCompany} branding={branding} className="mb-4" />
            <div className="text-white inline-block">
              <h1 className="text-2xl font-bold" id="company-name">
                {yourCompany?.name || "Your Company Name"}
              </h1>
            </div>
            <p className="mt-2">
              {yourCompany?.address || "Your Company Address"}
            </p>
            <p>{yourCompany?.phone || "Your Company Phone"}</p>
            {yourCompany?.email && <p>{yourCompany.email}</p>}
            {yourCompany?.website && <p>{yourCompany.website}</p>}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">BILLED TO</h2>
            <p>{billTo.name}</p>
            <p>{billTo.address}</p>
            <p>{billTo.phone}</p>
          </div>
        </div>
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">SHIP TO</h2>
            <p>{shipTo.name}</p>
            <p>{shipTo.address}</p>
            <p>{shipTo.phone}</p>
          </div>
          <div className="text-right">
            <p>Invoice #: {invoice.number}</p>
            <p>Invoice Date: {invoice.date}</p>
            <p>Due Date: {invoice.paymentDate}</p>
            <p>Due Amount: {formatCurrency(grandTotal, selectedCurrency)}</p>
          </div>
        </div>
      </div>
      <div 
        className="rounded-lg border -mt-[42px] w-[92%] mx-auto" 
        style={{ borderColor: branding?.primaryColor || '#3b82f6' }}
      >
                  <div id="item-data" className="w-full mb-8">
            <div 
              className="flex rounded-t" 
              style={{ backgroundColor: branding?.primaryColor + '40' || '#bfdbfe' }}
            >
            <div className="p-2 w-12"></div>
            <div className="p-2 flex-grow text-left">
              ITEM NAME/ITEM DESCRIPTION
            </div>
            <div className="p-2 flex-1 text-right">QTY.</div>
            <div className="p-2 flex-1 text-right">AMOUNT</div>
          </div>
          {items.map((item, index) => (
            <div key={index} className="flex border-t border-b">
              <div className="p-2 w-12 text-left">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="p-2 flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="p-2 w-24 text-right">{item.quantity}</div>
              <div className="p-2 flex-1 text-right">
                {formatCurrency(item.total, selectedCurrency)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <div className="w-2/3 p-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
          <div className="w-1/3">
            <div className="flex justify-between mb-2 p-2">
              <span>Sub Total:</span>
              <span>{formatCurrency(subTotal, selectedCurrency)}</span>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between mb-2 p-2">
                <span>Tax ({taxPercentage}%):</span>
                <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
              </div>
            )}
            <div 
              className="flex justify-between font-bold text-white p-2 mt-4" 
              style={{ backgroundColor: branding?.primaryColor || '#3b82f6' }}
            >
              <span className="text-left">Total</span>
              <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default Template3;
