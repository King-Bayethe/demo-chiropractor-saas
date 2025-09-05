import { submitAllMockForms, testSOAPAutopopulation } from './mockFormSubmissions';

// Function to run all mock form tests
export const runMockFormTests = async () => {
  console.log('🚀 Starting comprehensive mock form testing...');
  
  try {
    // Submit all mock forms
    const submissionResults = await submitAllMockForms();
    
    // Test SOAP autopopulation for each successful submission
    const soapTests = [];
    
    for (const [formType, result] of Object.entries(submissionResults)) {
      if (result.success && result.data?.patient_id) {
        console.log(`✅ ${formType.toUpperCase()} form submitted successfully for ${result.patientName}`);
        
        // Test SOAP autopopulation
        const soapResult = await testSOAPAutopopulation(result.data.patient_id);
        soapTests.push({
          formType,
          patientName: result.patientName,
          patientId: result.data.patient_id,
          soapResult
        });
      } else {
        console.log(`❌ ${formType.toUpperCase()} form submission failed:`, result.error);
      }
    }
    
    // Summary
    console.log('\n📊 Mock Form Testing Summary:');
    console.log('==========================================');
    
    const successfulSubmissions = Object.values(submissionResults).filter(r => r.success);
    console.log(`Form Submissions: ${successfulSubmissions.length}/4 successful`);
    
    soapTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.patientName} (${test.formType.toUpperCase()})`);
      console.log(`   Patient ID: ${test.patientId}`);
      console.log(`   SOAP Autofill: ${test.soapResult.success ? '✅ Success' : '❌ Failed'}`);
      
      if (test.soapResult.success && test.soapResult.soapData) {
        const soapData = test.soapResult.soapData;
        console.log(`   - Subjective: ${Object.keys(soapData.subjective || {}).length} fields populated`);
        console.log(`   - Objective: ${Object.keys(soapData.objective || {}).length} fields populated`);
        console.log(`   - Assessment: ${Object.keys(soapData.assessment || {}).length} fields populated`);
        console.log(`   - Plan: ${Object.keys(soapData.plan || {}).length} fields populated`);
      }
      console.log('');
    });
    
    return {
      success: true,
      submissionResults,
      soapTests,
      summary: {
        totalForms: 4,
        successfulSubmissions: successfulSubmissions.length,
        soapTestsRun: soapTests.length,
        allSuccessful: successfulSubmissions.length === 4 && soapTests.every(t => t.soapResult.success)
      }
    };
    
  } catch (error) {
    console.error('❌ Error during mock form testing:', error);
    return {
      success: false,
      error,
      message: 'Mock form testing failed'
    };
  }
};

// Export for manual testing
export { submitAllMockForms, testSOAPAutopopulation };