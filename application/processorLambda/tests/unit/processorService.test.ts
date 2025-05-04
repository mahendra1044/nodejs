// Import Chai for assertions
import { expect } from 'chai';
// Import Mocha for test framework
import { describe, it } from 'mocha';
// Import Sinon for mocking
import * as sinon from 'sinon';
// Import ProcessorService for testing
import { ProcessorService } from '../../src/services/processorService';
// Import interfaces for test data
import { SafeCreationRequest } from '../../src/interfaces/processorInterfaces';
// Import types for response mocking
import { SaviyntGroupStatusResponse, CyberArkSafeResponse } from '../../src/types/processorTypes';
// Import utility clients for mocking
import { HttpClient } from '../../src/utils/httpClient';
import { SQSClient } from '../../src/utils/sqsClient';
import { EmailClient } from '../../src/utils/emailClient';
import { ServiceNowClient } from '../../src/utils/serviceNowClient';
import { DynamoDBClient } from '../../src/utils/dynamodbClient';

/**
 * Unit tests for ProcessorService
 */
describe('ProcessorService', () => {
  // Declare ProcessorService instance
  let processorService: ProcessorService;
  // Declare stubs for client methods
  let httpGetStub: sinon.SinonStub;
  let httpPostStub: sinon.SinonStub;
  let sqsDeleteStub: sinon.SinonStub;
  let sqsSendDLQStub: sinon.SinonStub;
  let emailSendStub: sinon.SinonStub;
  let serviceNowStub: sinon.SinonStub;
  let dynamoGetStub: sinon.SinonStub;
  let dynamoSetStub: sinon.SinonStub;
  let dynamoDeleteStub: sinon.SinonStub;

  /**
   * Setup before each test
   */
  beforeEach(() => {
    // Initialize ProcessorService
    processorService = new ProcessorService();
    // Stub HttpClient methods
    httpGetStub = sinon.stub(HttpClient.prototype, 'get');
    httpPostStub = sinon.stub(HttpClient.prototype, 'post');
    // Stub SQSClient methods
    sqsDeleteStub = sinon.stub(SQSClient.prototype, 'deleteMessage');
    sqsSendDLQStub = sinon.stub(SQSClient.prototype, 'sendToDLQ');
    // Stub EmailClient method
    emailSendStub = sinon.stub(EmailClient.prototype, 'sendEmail');
    // Stub ServiceNowClient method
    serviceNowStub = sinon.stub(ServiceNowClient.prototype, 'createRITM');
    // Stub DynamoDBClient methods
    dynamoGetStub = sinon.stub(DynamoDBClient.prototype, 'getRetryCount');
    dynamoSetStub = sinon.stub(DynamoDBClient.prototype, 'setRetryCount');
    dynamoDeleteStub = sinon.stub(DynamoDBClient.prototype, 'deleteRetryCount');
  });

  /**
   * Cleanup after each test
   */
  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  /**
   * Test successful safe creation
   */
  it('should process a request successfully', async () => {
    // Define test request
    const request: SafeCreationRequest = {
      correlationId: '123',
      adGroupAttributes: { groupName: 'TestGroup', description: 'Test', owner: 'TestOwner' },
      pamSafeAttributes: { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' },
    };
    // Define SQS event
    const event: AWSLambda.SQSEvent = {
      Records: [{ messageId: '1', receiptHandle: 'rh1', body: JSON.stringify(request) }],
    };
    // Mock group status (exists and created)
    httpGetStub.resolves({ exists: true, status: 'CREATED', groupId: 'g123' });
    // Mock safe creation
    httpPostStub.resolves({ status: 'SUCCESS', safeId: 's456' });
    // Mock retry count
    dynamoGetStub.resolves(0);
    // Mock email send
    emailSendStub.resolves();
    // Mock SQS delete
    sqsDeleteStub.resolves();
    // Mock DynamoDB delete
    dynamoDeleteStub.resolves();

    // Process the event
    await processorService.processEvent(event);

    // Assert group status check called
    expect(httpGetStub.calledOnce).to.be.true;
    // Assert safe creation called
    expect(httpPostStub.calledOnce).to.be.true;
    // Assert email sent
    expect(emailSendStub.calledOnce).to.be.true;
    // Assert message deleted
    expect(sqsDeleteStub.calledOnce).to.be.true;
    // Assert retry count deleted
    expect(dynamoDeleteStub.calledOnce).to.be.true;
  });

  /**
   * Test max retries exceeded
   */
  it('should escalate to ServiceNow and move to DLQ after max retries', async () => {
    // Define test request
    const request: SafeCreationRequest = {
      correlationId: '123',
      adGroupAttributes: { groupName: 'TestGroup', description: 'Test', owner: 'TestOwner' },
      pamSafeAttributes: { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' },
    };
    // Define SQS event
    const event: AWSLambda.SQSEvent = {
      Records: [{ messageId: '1', receiptHandle: 'rh1', body: JSON.stringify(request) }],
    };
    // Mock retry count at max
    dynamoGetStub.resolves(6);
    // Mock ServiceNow RITM creation
    serviceNowStub.resolves('RITM123');
    // Mock email send
    emailSendStub.resolves();
    // Mock DLQ send
    sqsSendDLQStub.resolves();
    // Mock SQS delete
    sqsDeleteStub.resolves();
    // Mock DynamoDB delete
    dynamoDeleteStub.resolves();

    // Process the event
    await processorService.processEvent(event);

    // Assert ServiceNow called
    expect(serviceNowStub.calledOnce).to.be.true;
    // Assert email sent
    expect(emailSendStub.calledOnce).to.be.true;
    // Assert DLQ sent
    expect(sqsSendDLQStub.calledOnce).to.be.true;
    // Assert message deleted
    expect(sqsDeleteStub.calledOnce).to.be.true;
    // Assert retry count deleted
    expect(dynamoDeleteStub.calledOnce).to.be.true;
  });
});