// Import Chai for assertions
import { expect } from 'chai';
// Import Mocha for test framework
import { describe, it } from 'mocha';
// Import Sinon for mocking
import * as sinon from 'sinon';
// Import CyberArkService for testing
import { CyberArkService } from '../../src/services/cyberArkService';
// Import interfaces for test data
import { SafeCreationRequest } from '../../src/interfaces/cyberArkInterfaces';
// Import types for response mocking
import { CyberArkSafeResponse } from '../../src/types/cyberArkTypes';
// Import axios for mocking HTTP requests
import * as axios from 'axios';
// Import SQSClient for mocking
import { SQSClient } from '../../src/utils/sqsClient';

/**
 * Unit tests for CyberArkService
 */
describe('CyberArkService', () => {
  // Declare CyberArkService instance
  let cyberArkService: CyberArkService;
  // Declare stub for axios.post
  let axiosPostStub: sinon.SinonStub;
  // Declare stub for SQSClient.sendMessage
  let sqsSendStub: sinon.SinonStub;

  /**
   * Setup before each test
   */
  beforeEach(() => {
    // Initialize CyberArkService
    cyberArkService = new CyberArkService();
    // Stub axios.post method
    axiosPostStub = sinon.stub(axios.default, 'post');
    // Stub SQSClient.sendMessage method
    sqsSendStub = sinon.stub(SQSClient.prototype, 'sendMessage');
  });

  /**
   * Cleanup after each test
   */
  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  /**
   * Test successful safe creation initiation
   */
  it('should initiate safe creation successfully', async () => {
    // Define test safe creation request
    const request: SafeCreationRequest = {
      correlationId: '123',
      adGroupAttributes: { groupName: 'TestGroup', description: 'Test', owner: 'TestOwner' },
      pamSafeAttributes: { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' },
    };
    // Configure stub to resolve successfully
    sqsSendStub.resolves();

    // Call initiateSafeCreation method
    const response = await cyberArkService.initiateSafeCreation(request);
    // Assert response status
    expect(response.status).to.equal('SUCCESS');
    // Assert response message
    expect(response.message).to.include('Processing will complete shortly');
    // Assert SQS send called once
    expect(sqsSendStub.calledOnce).to.be.true;
  });

  /**
   * Test safe creation initiation failure
   */
  it('should handle safe creation initiation failure', async () => {
    // Define test safe creation request
    const request: SafeCreationRequest = {
      correlationId: '123',
      adGroupAttributes: { groupName: 'TestGroup', description: 'Test', owner: 'TestOwner' },
      pamSafeAttributes: { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' },
    };
    // Configure stub to reject with error
    sqsSendStub.rejects(new Error('SQS error'));

    // Call initiateSafeCreation method
    const response = await cyberArkService.initiateSafeCreation(request);
    // Assert response status
    expect(response.status).to.equal('FAILED');
    // Assert error message
    expect(response.message).to.equal('SQS error');
    // Assert SQS send called once
    expect(sqsSendStub.calledOnce).to.be.true;
  });

  /**
   * Test successful safe creation
   */
  it('should create a safe successfully', async () => {
    // Define test safe attributes
    const attributes = { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' };
    // Define mock response
    const mockResponse: CyberArkSafeResponse = { status: 'SUCCESS', safeId: '456' };
    // Configure stub to resolve with mock response
    axiosPostStub.resolves({ data: mockResponse });

    // Call createSafe method
    const response = await cyberArkService.createSafe(attributes);
    // Assert response status
    expect(response.status).to.equal('SUCCESS');
    // Assert safeId
    expect(response.safeId).to.equal('456');
    // Assert axios.post called once
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  /**
   * Test safe creation failure
   */
  it('should handle safe creation failure', async () => {
    // Define test safe attributes
    const attributes = { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' };
    // Configure stub to reject with error
    axiosPostStub.rejects(new Error('API error'));

    // Call createSafe method
    const response = await cyberArkService.createSafe(attributes);
    // Assert response status
    expect(response.status).to.equal('FAILED');
    // Assert error message
    expect(response.message).to.equal('API error');
    // Assert axios.post called once
    expect(axiosPostStub.calledOnce).to.be.true;
  });
});