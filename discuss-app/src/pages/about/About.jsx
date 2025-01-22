import React from 'react';
import "./about.css";

export default function About() {
  return (
    <div className="about">
      <div className="aboutItem">
        <span className="aboutTitle">ABOUT STUDENT ACHIEVEMENTS</span>
        <img 
          className="aboutImg"
          src="\achievement.jpg"
          alt="Student Achievements"
        />

        <div className="mainpoints">
          <h1>Celebrating Student Success</h1>
          <p>
            Welcome to AchievementBlog, a platform dedicated to celebrating the accomplishments of students from diverse fields and backgrounds. Here, we showcase inspiring stories of academic excellence, extracurricular triumphs, and personal growth. Our mission is to highlight the incredible potential of students and provide a space where their hard work and dedication are recognized and celebrated.
          </p>
          <br></br>

          <h1>Inspiring Others Through Stories</h1>
          <p>
            At AchievementBlog, we believe every success story has the power to motivate and inspire others. Whether it's excelling in academics, winning competitions, or overcoming challenges, we invite students to share their journeys. By contributing your achievements, you can empower your peers and create a community that values perseverance, determination, and ambition. Together, we can build a network of inspiration and support for students everywhere.
          </p>
        </div>

        <div className="subpoints">
          <h4>Target Audience:</h4>
          <p> Students, educators, and anyone inspired by academic and extracurricular achievements.</p>

          <h4>Content Focus:</h4>
          <p> Success stories, milestones, and strategies that drive student achievements.</p>

          <h3>Features:</h3>
          <h4>Inspiring Stories:</h4>
          <p> Read and share stories that celebrate determination and success.</p>

          <h4>Achievements Highlights:</h4>
          <p> Explore highlights of academic and extracurricular accomplishments.</p>

          <h4>Motivational Resources:</h4>
          <p> Access tips, insights, and strategies to achieve your goals.</p>

          <h4>Purpose:</h4>
          <p> To create a platform that encourages, recognizes, and celebrates student achievements, fostering a culture of positivity and growth.</p>
        </div>
      </div>
    </div>
  );
}
