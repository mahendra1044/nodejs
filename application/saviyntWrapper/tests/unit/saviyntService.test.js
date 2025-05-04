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
// Import SaviyntService for testing
const saviyntService_1 = require("../../src/services/saviyntService");
// Import axios for mocking HTTP requests
const axios = __importStar(require("axios"));
/**
 * Unit tests for SaviyntService
 */
(0, mocha_1.describe)('SaviyntService', () => {
    // Declare SaviyntService instance
    let saviyntService;
    // Declare stub for axios.post
    let axiosPostStub;
    // Declare stub for axios.get
    let axiosGetStub;
    /**
     * Setup before each test
     */
    beforeEach(() => {
        // Initialize SaviyntService
        saviyntService = new saviyntService_1.SaviyntService();
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
    (0, mocha_1.it)('should create a group successfully', async () => {
        // Define test group attributes
        const attributes = {
            groupName: 'TestGroup',
            description: 'Test Description',
            owner: 'TestOwner',
        };
        // Define mock response
        const mockResponse = { status: 'SUCCESS', groupId: '123' };
        // Configure stub to resolve with mock response
        axiosPostStub.resolves({ data: mockResponse });
        // Call createGroup method
        const response = await saviyntService.createGroup(attributes);
        // Assert response status
        (0, chai_1.expect)(response.status).to.equal('SUCCESS');
        // Assert groupId
        (0, chai_1.expect)(response.groupId).to.equal('123');
        // Assert axios.post called once
        (0, chai_1.expect)(axiosPostStub.calledOnce).to.be.true;
    });
    /**
     * Test group creation failure
     */
    (0, mocha_1.it)('should handle group creation failure', async () => {
        // Define test group attributes
        const attributes = {
            groupName: 'TestGroup',
            description: 'Test Description',
            owner: 'TestOwner',
        };
        // Configure stub to reject with error
        axiosPostStub.rejects(new Error('API error'));
        // Call createGroup method
        const response = await saviyntService.createGroup(attributes);
        // Assert response status
        (0, chai_1.expect)(response.status).to.equal('FAILED');
        // Assert error message
        (0, chai_1.expect)(response.message).to.equal('API error');
        // Assert axios.post called once
        (0, chai_1.expect)(axiosPostStub.calledOnce).to.be.true;
    });
    /**
     * Test successful group status check
     */
    (0, mocha_1.it)('should check group status successfully', async () => {
        // Define test group name
        const groupName = 'TestGroup';
        // Define mock response
        const mockResponse = { exists: true, groupId: '123', status: 'CREATED' };
        // Configure stub to resolve with mock response
        axiosGetStub.resolves({ data: mockResponse });
        // Call checkGroupStatus method
        const response = await saviyntService.checkGroupStatus(groupName);
        // Assert group exists
        (0, chai_1.expect)(response.exists).to.be.true;
        // Assert groupId
        (0, chai_1.expect)(response.groupId).to.equal('123');
        // Assert status
        (0, chai_1.expect)(response.status).to.equal('CREATED');
        // Assert axios.get called once
        (0, chai_1.expect)(axiosGetStub.calledOnce).to.be.true;
    });
    /**
     * Test group status check failure
     */
    (0, mocha_1.it)('should handle group status check failure', async () => {
        // Define test group name
        const groupName = 'TestGroup';
        // Configure stub to reject with error
        axiosGetStub.rejects(new Error('API error'));
        // Call checkGroupStatus method
        const response = await saviyntService.checkGroupStatus(groupName);
        // Assert group does not exist
        (0, chai_1.expect)(response.exists).to.be.false;
        // Assert status
        (0, chai_1.expect)(response.status).to.equal('FAILED');
        // Assert error message
        (0, chai_1.expect)(response.message).to.equal('API error');
        // Assert axios.get called once
        (0, chai_1.expect)(axiosGetStub.calledOnce).to.be.true;
    });
});
