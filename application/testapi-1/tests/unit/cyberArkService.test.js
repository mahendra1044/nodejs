"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import Chai for assertions
const chai_1 = require("chai");
// Import Mocha for test framework
const mocha_1 = require("mocha");
// Import Sinon for mocking
const sinon = __importStar(require("sinon"));
// Import CyberArkService for testing
const cyberArkService_1 = require("../../src/services/cyberArkService");
// Import axios for mocking HTTP requests
const axios = __importStar(require("axios"));
// Import SQSClient for mocking
const sqsClient_1 = require("../../src/utils/sqsClient");
/**
 * Unit tests for CyberArkService
 */
(0, mocha_1.describe)('CyberArkService', () => {
    // Declare CyberArkService instance
    let cyberArkService;
    // Declare stub for axios.post
    let axiosPostStub;
    // Declare stub for SQSClient.sendMessage
    let sqsSendStub;
    /**
     * Setup before each test
     */
    beforeEach(() => {
        // Initialize CyberArkService
        cyberArkService = new cyberArkService_1.CyberArkService();
        // Stub axios.post method
        axiosPostStub = sinon.stub(axios.default, 'post');
        // Stub SQSClient.sendMessage method
        sqsSendStub = sinon.stub(sqsClient_1.SQSClient.prototype, 'sendMessage');
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
    (0, mocha_1.it)('should initiate safe creation successfully', async () => {
        // Define test safe creation request
        const request = {
            correlationId: '123',
            adGroupAttributes: { groupName: 'TestGroup', description: 'Test', owner: 'TestOwner' },
            pamSafeAttributes: { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' },
        };
        // Configure stub to resolve successfully
        sqsSendStub.resolves();
        // Call initiateSafeCreation method
        const response = await cyberArkService.initiateSafeCreation(request);
        // Assert response status
        (0, chai_1.expect)(response.status).to.equal('SUCCESS');
        // Assert response message
        (0, chai_1.expect)(response.message).to.include('Processing will complete shortly');
        // Assert SQS send called once
        (0, chai_1.expect)(sqsSendStub.calledOnce).to.be.true;
    });
    /**
     * Test safe creation initiation failure
     */
    (0, mocha_1.it)('should handle safe creation initiation failure', async () => {
        // Define test safe creation request
        const request = {
            correlationId: '123',
            adGroupAttributes: { groupName: 'TestGroup', description: 'Test', owner: 'TestOwner' },
            pamSafeAttributes: { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' },
        };
        // Configure stub to reject with error
        sqsSendStub.rejects(new Error('SQS error'));
        // Call initiateSafeCreation method
        const response = await cyberArkService.initiateSafeCreation(request);
        // Assert response status
        (0, chai_1.expect)(response.status).to.equal('FAILED');
        // Assert error message
        (0, chai_1.expect)(response.message).to.equal('SQS error');
        // Assert SQS send called once
        (0, chai_1.expect)(sqsSendStub.calledOnce).to.be.true;
    });
    /**
     * Test successful safe creation
     */
    (0, mocha_1.it)('should create a safe successfully', async () => {
        // Define test safe attributes
        const attributes = { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' };
        // Define mock response
        const mockResponse = { status: 'SUCCESS', safeId: '456' };
        // Configure stub to resolve with mock response
        axiosPostStub.resolves({ data: mockResponse });
        // Call createSafe method
        const response = await cyberArkService.createSafe(attributes);
        // Assert response status
        (0, chai_1.expect)(response.status).to.equal('SUCCESS');
        // Assert safeId
        (0, chai_1.expect)(response.safeId).to.equal('456');
        // Assert axios.post called once
        (0, chai_1.expect)(axiosPostStub.calledOnce).to.be.true;
    });
    /**
     * Test safe creation failure
     */
    (0, mocha_1.it)('should handle safe creation failure', async () => {
        // Define test safe attributes
        const attributes = { safeName: 'TestSafe', description: 'Test', managingCPM: 'CPM' };
        // Configure stub to reject with error
        axiosPostStub.rejects(new Error('API error'));
        // Call createSafe method
        const response = await cyberArkService.createSafe(attributes);
        // Assert response status
        (0, chai_1.expect)(response.status).to.equal('FAILED');
        // Assert error message
        (0, chai_1.expect)(response.message).to.equal('API error');
        // Assert axios.post called once
        (0, chai_1.expect)(axiosPostStub.calledOnce).to.be.true;
    });
});
