import React, { useState } from 'react';
import styles from './AD_Alumini_form.module.css';
import Sidebar from './Components/Sidebar/Sidebar';
import { DateInput } from '../../components/Calendar';

const Admin_Alumini_Form = ( { onLogout } ) => {
  const [showExams, setShowExams] = useState(false);
  const [qualRows, setQualRows] = useState([{ id: 1 }]);
  const [alumniRows, setAlumniRows] = useState([{ id: 1 }]);
  const [othersExam, setOthersExam] = useState({ name: '', marks: '' });
  const [startYear, setStartYear] = useState('');
  const endYear = startYear ? parseInt(startYear) + 4 : '';

  const addQualRow = () => {
    setQualRows([...qualRows, { id: Date.now() }]);
  };

  const deleteQualRow = (id) => {
    if (qualRows.length > 1) {
      setQualRows(qualRows.filter(row => row.id !== id));
    }
  };

  const addAlumniRow = () => {
    setAlumniRows([...alumniRows, { id: Date.now() }]);
  };

  const deleteAlumniRow = (id) => {
    if (alumniRows.length > 1) {
      setAlumniRows(alumniRows.filter(row => row.id !== id));
    }
  };

  const handleOthersExamChange = (field, value) => {
    setOthersExam(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.pageLayout}>
      
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} currentView={'alumini'} />


      {/* Main Content Area */}
      <main className={styles.mainContent}>
          {/* Back Button */}
          <div className={styles.backButton} onClick={() => window.history.back()}>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
          </div>

        <div className={styles.formContainer}>
  
          {/* Section 1: Personal Details */}
          <section className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Section 1: Personal Details</h2>
            <div className={styles.formStack}>
              
              <div className={styles.gridTwoCol}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Full Name</label>
                  <input type="text" className={styles.textInput} placeholder="e.g. Alexander Pierce" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Father/Guardian Name</label>
                  <input type="text" className={styles.textInput} placeholder="e.g. Robert Pierce" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className={styles.inputLabel} >Email Address</label>
                <input type="email" id="email" className={styles.textInput} placeholder="Email Address" />
              </div>

              <div className={styles.gridThreeCol}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Date of Birth</label>
                  <DateInput theme="admin" className={styles.textInput} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Years of Study (From)</label>
                  <select
                    className={styles.selectInput}
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 50 }, (_, i) => 2001 + i).map((year) => (
                      <option className={styles.dd} key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>(To)</label>
                  <input
                    type="text"
                    className={styles.selectInput}
                    value={endYear}
                    disabled
                    placeholder="Auto-filled"
                    style={{ cursor: 'not-allowed', backgroundColor: '#f5f5f5'}}
                  />
                </div>
              </div>

              <div className={styles.gridTwoCol}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Degree</label>
                  <select className={styles.selectInput}>
                    <option value="">Select Degree</option>
                    <option value="B.E">B.E</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.E">M.E</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                    <option value="Ph.D">Ph.D</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Course / Branch</label>
                  <select className={styles.selectInput}>
                    <option value="">Select Course / Branch</option>
                    <option value="CSE">Computer Science and Engineering (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics and Communication Engineering (ECE)</option>
                    <option value="EEE">Electrical and Electronics Engineering (EEE)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                    <option value="AIDS">Artificial Intelligence and Data Science (AIDS)</option>
                  </select>
                </div>
              </div>

              <div className={`${styles.gridTwoCol} ${styles.addressSection}`}>
                
                {/* Present Address */}
                <div className={styles.addressBox}>
                  <div className={styles.addressHeader}>
                    <span className="material-symbols-outlined">location_on</span>
                    <span>Present Address</span>
                  </div>
                  <div className={styles.addressFields}>
                    <input type="text" className={styles.textInput} placeholder="Street Address" />
                    <div className={styles.gridTwoColSmall}>
                      <input type="text" className={styles.textInput} placeholder="City" />
                      <input type="text" className={styles.textInput} placeholder="PIN Code" />
                    </div>
                    <input type="text" className={styles.textInput} placeholder="Mobile Number" />
                  </div>
                </div>

                {/* Permanent Address */}
                <div className={styles.addressBox}>
                  <div className={styles.addressHeader}>
                    <span className="material-symbols-outlined">home</span>
                    <span>Permanent Address</span>
                  </div>
                  <div className={styles.addressFields}>
                    <input type="text" className={styles.textInput} placeholder="Street Address" />
                    <div className={styles.gridTwoColSmall}>
                      <input type="text" className={styles.textInput} placeholder="City" />
                      <input type="text" className={styles.textInput} placeholder="PIN Code" />
                    </div>
                    <input type="text" className={styles.textInput} placeholder="Mobile Number" />
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Section 2: Qualifications & Employment */}
          <section className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Section 2: Qualifications & Employment</h2>
            <div className={styles.formStackLarge}>
              
              {/* Exams */}
              <div>
                <label className={styles.inputLabel}>Competitive Exams Cleared</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="exam_cleared" className={styles.radioInput} onChange={() => setShowExams(true)} />
                    <span>Yes</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="exam_cleared" className={styles.radioInput} onChange={() => setShowExams(false)} defaultChecked />
                    <span>No</span>
                  </label>
                </div>

                {showExams && (
                  <div className={styles.examsBox}>
                    <p className={styles.examsBoxTitle}>Exams and Marks/Score</p>
                    <div className={styles.examsContainer}>
                      {['GRE', 'TOEFL', 'UPSC', 'GATE', 'IAS'].map((exam) => (
                        <div key={exam} className={styles.examRow}>
                          <label className={styles.examLabel}>{exam}</label>
                          <input type="text" className={styles.examMarksInput} placeholder="Enter mark" />
                        </div>
                      ))}

                      {/* Others Exam Section */}
                      <div className={styles.examDivider}></div>
                      <div className={styles.examRow}>
                        <label className={styles.examLabel}>Other Exam</label>
                        <div className={styles.othersInputGroup}>
                          <input
                            type="text"
                            className={styles.examMarksInput}
                            placeholder="Exam name"
                            value={othersExam.name}
                            onChange={(e) => handleOthersExamChange('name', e.target.value)}
                          />
                          <input
                            type="text"
                            className={styles.examMarksInput}
                            placeholder="Mark"
                            value={othersExam.marks}
                            onChange={(e) => handleOthersExamChange('marks', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* College Qualifications Table */}
              <div>
                <label className={styles.inputLabel}>College Qualifications</label>
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Institution</th>
                        <th>Year of Passing</th>
                        <th>% of Marks</th>
                        <th>Board / University</th>
                        <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualRows.map((row) => (
                        <tr key={row.id}>
                          <td><input type="text" className={styles.tableInput} placeholder="e.g. B.E" /></td>
                          <td><input type="text" className={styles.tableInput} placeholder="KSRCE" /></td>
                          <td><input type="text" className={styles.tableInput} placeholder="2018" /></td>
                          <td><input type="text" className={styles.tableInput} placeholder="85%" /></td>
                          <td><input type="text" className={styles.tableInput} placeholder="Anna University" /></td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => deleteQualRow(row.id)}
                              title="Delete row"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className={styles.addRowBtn}
                    onClick={addQualRow}
                  >
                    + Add Row
                  </button>
              </div>
<br />
              {/* Employment Details */}
              <div>
                <p className={styles.subSectionTitle}>Employment Details</p>
                <div className={styles.gridTwoCol}>
                  <div className={styles.inputGroup}>
                    <label className={styles.labelSmall}>Placement Type</label>
                    <div className={styles.radioGroupWrap}>
                      {['On-campus', 'Off-campus', 'Others', 'To be employed'].map(type => (
                         <label key={type} className={styles.radioLabel}>
                          <input type="radio" name="placement" className={styles.radioInput} />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.labelSmall}>Designation</label>
                    <input type="text" className={styles.textInput} placeholder="e.g. Software Engineer" />
                  </div>
                </div>
                
                <div className={styles.gridTwoColLargeGap}>
                  <div className={styles.inputGroup}>
                    <label className={styles.labelSmall}>Company Address</label>
                    <textarea className={styles.textareaInput} placeholder="Organization name and full address..." rows="3"></textarea>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.labelSmall}>Remarks</label>
                    <textarea className={styles.textareaInput} placeholder="Any specific remarks about employment..." rows="3"></textarea>
                  </div>
                </div>
              </div>
            </div>            
          </div>
          </section>

          {/* Section 3: Additional Info */}
          <section className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Section 3: Additional Info</h2>
            
            <div className={styles.gridTwoCol}>              
              {/* Entrepreneur */}
              <div className={styles.formStack}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Have you become an entrepreneur?</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="entrepreneur" className={styles.radioInput} />
                      <span>Yes</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="entrepreneur" className={styles.radioInput} />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <input type="text" className={styles.textInputSm} placeholder="Name and Address of Organization" />
                <input type="text" className={styles.textInputSm} placeholder="Nature of work / Product" />
                <div className={styles.gridTwoColSmall}>
                  <input type="text" className={styles.textInputSm} placeholder="Annual Turnover" />
                  <input type="text" className={styles.textInputSm} placeholder="No. of Employees" />
                </div>
              </div>

              {/* Marital Status */}
              <div className={styles.formStack}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Marital Status</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="marital" className={styles.radioInput} />
                      <span>Single</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="marital" className={styles.radioInput} />
                      <span>Married</span>
                    </label>
                  </div>
                </div>
                <input type="text" className={styles.textInputSm} placeholder="Spouse Name" />
                <input type="text" className={styles.textInputSm} placeholder="Spouse Qualification" />
                <input type="text" className={styles.textInputSm} placeholder="No. of Children" />
              </div>

            </div>

            <div className={styles.textAreaGroup}>
              <label className={styles.inputLabel}>Extra-Curricular Activities</label>
              <textarea className={styles.textareaInput} placeholder="List your activities and achievements during or after college..." rows="4"></textarea>
            </div>

            <div className={styles.textAreaGroup}>
              <label className={styles.inputLabel}>Any Other Relevant Information</label>
              <textarea className={styles.textareaInput} placeholder="Provide any additional details you would like to share..." rows="4"></textarea>
            </div>

            {/* Alumni Known Table */}
            <div className={styles.textAreaGroup}>
              <label className={styles.inputLabel}>Alumni Details You Know (Optional)</label>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTableSm}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Degree</th>
                      <th>Batch</th>
                      <th>E-Mail</th>
                      <th>Phone/Mobile No.</th>
                      <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumniRows.map((row) => (
                      <tr key={row.id}>
                        <td><input type="text" className={styles.tableInputSm} placeholder="John Doe" /></td>
                        <td><input type="text" className={styles.tableInputSm} placeholder="B.E / B.Tech" /></td>
                        <td><input type="text" className={styles.tableInputSm} placeholder="2020" /></td>
                        <td><input type="text" className={styles.tableInputSm} placeholder="john@email.com" /></td>
                        <td><input type="text" className={styles.tableInputSm} placeholder="9876543210" /></td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => deleteAlumniRow(row.id)}
                            title="Delete row"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className={styles.addRowBtn}
                  onClick={addAlumniRow}
                >
                  + Add Row
                </button>
              </div>
            </div>

          </section>

          {/* Submit Action */}
          <div className={styles.submitSection}>
            <button className={styles.submitBtn} type="button">
              Submit Information
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Admin_Alumini_Form;