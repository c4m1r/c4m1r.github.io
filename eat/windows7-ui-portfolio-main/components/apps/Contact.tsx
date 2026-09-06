/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      alert("Please fill out your name, email, and message before sending.");
      return;
    }
    const subject = encodeURIComponent(`Portfolio Contact from ${formData.firstName} ${formData.lastName}`);
    const body = encodeURIComponent(formData.message);
    window.location.href = `mailto:hello@gividu.dev?subject=${subject}&body=${body}`;
    setFormData({ firstName: '', lastName: '', email: '', message: '' });
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto" style={{ backgroundColor: '#f0f0f0', fontFamily: '"Segoe UI", Tahoma, sans-serif', fontSize: '12px' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <img src="/win7/Filetypes, Devices, Miscellaneous/imageres_104.ico" alt="Info" style={{ width: '32px', height: '32px' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#003399', margin: '0 0 4px 0' }}>Contact Information</h2>
            <p style={{ margin: 0, color: '#333' }}>Please fill out the form below to send me a message.</p>
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #dfdfdf', borderBottom: '1px solid #fff' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset style={{ padding: '15px', marginBottom: '15px' }}>
          <legend>Personal Details</legend>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="firstName">First Name:</label>
              <input 
                type="text" 
                id="firstName"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="lastName">Last Name:</label>
              <input 
                type="text" 
                id="lastName"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="email">Email Address:</label>
            <input 
              type="email" 
              id="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%' }}
            />
          </div>
        </fieldset>

        <fieldset style={{ padding: '15px', marginBottom: '20px' }}>
          <legend>Message Details</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="message">Your Message:</label>
            <textarea 
              id="message"
              rows={6}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #dfdfdf', paddingTop: '15px', marginTop: '10px' }}>
          <button type="submit" style={{ minWidth: '85px', padding: '4px 10px' }}>
            Send
          </button>
          <button 
            type="button" 
            onClick={() => setFormData({ firstName: '', lastName: '', email: '', message: '' })}
            style={{ minWidth: '85px', padding: '4px 10px' }}
          >
            Clear
          </button>
        </div>
      </form>

    </div>
  );
}
