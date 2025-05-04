// Import Chai for assertions
import { expect } from 'chai';
// Import Mocha for test framework
import { describe, it } from 'mocha';
// Import Sinon for mocking
import * as sinon from 'sinon';
// Import SaviyntService for testing
import { SaviyntService } from '../../src/services/saviyntService';
// Import interfaces for test data
import { SaviyntGroupAttributes } from '../../src/interfaces/saviyntInterfaces';
// Import types for response mocking
import { SaviyntGroupResponse, SaviyntGroupStatusResponse } from '../../src/types/saviyntTypes';
// Import axios for mocking HTTP requests
import * as axios from 'axios';

/**
 * Unit tests for SaviyntService
 */
describe('SaviyntService', () => {
  // Declare SaviyntService instance
  let saviyntService: SaviyntService;
  // Declare stub for axios.post
  let axiosPostStub: sinon.SinonStub;
  // Declare stub for axios.get
  let axiosGetStub: sinon.SinonStub;

  /**
   * Setup before each test
   */
  beforeEach(() => {
    // Initialize SaviyntService
    saviyntService = new SaviyntService();
    // Stub axios.post method
    axiosPostStub = sinon.stub(axios.default, 'post');
    // Stub axios.get method
    axiosGetStub = sinon.stub(axios.default, 'get');
  });

  /**
   * Cleanup after each test
   */
  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  /**
   * Test successful group creation
   */
  it('should create a group successfully', async () => {
    // Define test group attributes
    const attributes: SaviyntGroupAttributes = {
      groupName: 'TestGroup',
      description: 'Test Description',
      owner: 'TestOwner',
    };
    // Define mock response
    const mockResponse: SaviyntGroupResponse = { status: 'SUCCESS', groupId: '123' };
    // Configure stub to resolve with mock response
    axiosPostStub.resolves({ data: mockResponse });

    // Call createGroup method
    const response = await saviyntService.createGroup(attributes);
    // Assert response status
    expect(response.status).to.equal('SUCCESS');
    // Assert groupId
    expect(response.groupId).to.equal('123');
    // Assert axios.post called once
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  /**
   * Test group creation failure
   */
  it('should handle group creation failure', async () => {
    // Define test group attributes
    const attributes: SaviyntGroupAttributes = {
      groupName: 'TestGroup',
      description: 'Test Description',
      owner: 'TestOwner',
    };
    // Configure stub to reject with error
    axiosPostStub.rejects(new Error('API error'));

    // Call createGroup method
    const response = await saviyntService.createGroup(attributes);
    // Assert response status
    expect(response.status).to.equal('FAILED');
    // Assert error message
    expect(response.message).to.equal('API error');
    // Assert axios.post called once
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  /**
   * Test successful group status check
   */
  it('should check group status successfully', async () => {
    // Define test group name
    const groupName = 'TestGroup';
    // Define mock response
    const mockResponse: SaviyntGroupStatusResponse = { exists: true, groupId: '123', status: 'CREATED' };
    // Configure stub to resolve with mock response
    axiosGetStub.resolves({ data: mockResponse });

    // Call checkGroupStatus method
    const response = await saviyntService.checkGroupStatus(groupName);
    // Assert group exists
    expect(response.exists).to.be.true;
    // Assert groupId
    expect(response.groupId).to.equal('123');
    // Assert status
    expect(response.status).to.equal('CREATED');
    // Assert axios.get called once
    expect(axiosGetStub.calledOnce).to.be.true;
  });

  /**
   * Test group status check failure
   */
  it('should handle group status check failure', async () => {
    // Define test group name
    const groupName = 'TestGroup';
    // Configure stub to reject with error
    axiosGetStub.rejects(new Error('API error'));

    // Call checkGroupStatus method
    const response = await saviyntService.checkGroupStatus(groupName);
    // Assert group does not exist
    expect(response.exists).to.be.false;
    // Assert status
    expect(response.status).to.equal('FAILED');
    // Assert error message
    expect(response.message).to.equal('API error');
    // Assert axios.get called once
    expect(axiosGetStub.calledOnce).to.be.true;
  });
});