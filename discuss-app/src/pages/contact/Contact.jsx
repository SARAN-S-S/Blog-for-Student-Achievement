import React from 'react';
import './contact.css';

export default function Contact() {
  const members = [

    {
      name: 'MADHUMITHA S',
      department: 'INFORMATION TECHNOLOGY',
      email: 'madhumitha.it21@bitsathy.ac.in',
      linkedin: 'https://www.linkedin.com/in/saran-s-s-84a696245/',
    },
    {
      name: 'THARSHILIN BANU M',
      department: 'Electronics and Communication Engineering',
      email: 'tharshilinbanu.ec21@bitsathy.ac.in',
      linkedin: 'https://www.linkedin.com/in/saran-s-s-84a696245/',
    },
    
    {
      name: 'SARAN S S',
      department: 'Electronics and Communication Engineering',
      email: 'saran.ec21@bitsathy.ac.in',
      linkedin: 'https://www.linkedin.com/in/saran-s-s-84a696245/',
    },
  ];

  return (
    <div className="contactContainer">
      {members.map((member, index) => (
        <div className="contactCard" key={index}>
          <h2 className="contactName">Name: {member.name}</h2>
          <p className="contactDepartment">Department: {member.department}</p>
          <a href={`mailto:${member.email}`} className="contactEmail">Email: {member.email}</a>
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="contactLink">
            LinkedIn
          </a>
        </div>
      ))}
    </div>
  );
}
