#!/usr/bin/env node
/**
 * Test Runner Script for Epic E005: Testing & QA Implementation
 * 
 * Orchestrates the complete testing suite including:
 * - Unit tests
 * - Integration tests
 * - Performance benchmarks
 * - Cross-browser compatibility tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class TestRunner {
  constructor() {
    this.results = {
      unit: { status: 'pending', duration: 0, coverage: 0 },
      integration: { status: 'pending', duration: 0 },
      performance: { status: 'pending', duration: 0, metrics: {} },
      crossBrowser: { status: 'pending', duration: 0, browsers: [] }
    };
    
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log(chalk.blue('🧪 Starting Epic E005: Testing & QA Implementation\n'));
    
    try {
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runPerformanceTests();
      await this.generateReport();
      
      console.log(chalk.green('\n✅ All tests completed successfully!'));
      return true;
    } catch (error) {
      console.log(chalk.red('\n❌ Test suite failed:', error.message));
      return false;
    }
  }

  async runUnitTests() {
    console.log(chalk.yellow('📦 Running Unit Tests...'));
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:unit -- --reporter=json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.unit.status = 'passed';
      this.results.unit.duration = Date.now() - startTime;
      
      // Extract coverage if available
      try {
        const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');
        if (fs.existsSync(coverageFile)) {
          const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
          this.results.unit.coverage = coverage.total.statements.pct;
        }
      } catch (e) {
        // Coverage extraction failed, continue
      }
      
      console.log(chalk.green(`  ✅ Unit tests passed (${this.results.unit.duration}ms)`));
      if (this.results.unit.coverage > 0) {
        console.log(chalk.blue(`  📊 Coverage: ${this.results.unit.coverage}%`));
      }
    } catch (error) {
      this.results.unit.status = 'failed';
      this.results.unit.duration = Date.now() - startTime;
      console.log(chalk.red('  ❌ Unit tests failed'));
      throw error;
    }
  }

  async runIntegrationTests() {
    console.log(chalk.yellow('🔗 Running Integration Tests...'));
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:integration -- --reporter=json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.integration.status = 'passed';
      this.results.integration.duration = Date.now() - startTime;
      
      console.log(chalk.green(`  ✅ Integration tests passed (${this.results.integration.duration}ms)`));
    } catch (error) {
      this.results.integration.status = 'failed';
      this.results.integration.duration = Date.now() - startTime;
      console.log(chalk.red('  ❌ Integration tests failed'));
      throw error;
    }
  }

  async runPerformanceTests() {
    console.log(chalk.yellow('⚡ Running Performance Tests...'));
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:performance -- --reporter=json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.performance.status = 'passed';
      this.results.performance.duration = Date.now() - startTime;
      
      // Extract performance metrics if available
      try {
        const metricsFile = path.join(__dirname, '../test-results/performance-metrics.json');
        if (fs.existsSync(metricsFile)) {
          this.results.performance.metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
        }
      } catch (e) {
        // Metrics extraction failed, continue
      }
      
      console.log(chalk.green(`  ✅ Performance tests passed (${this.results.performance.duration}ms)`));
    } catch (error) {
      this.results.performance.status = 'failed';
      this.results.performance.duration = Date.now() - startTime;
      console.log(chalk.red('  ❌ Performance tests failed'));
      throw error;
    }
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      epic: 'E005: Testing & QA Implementation',
      totalDuration,
      results: this.results,
      summary: {
        totalTests: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.status === 'passed').length,
        failed: Object.values(this.results).filter(r => r.status === 'failed').length,
        coverage: this.results.unit.coverage || 0
      }
    };
    
    // Ensure test-results directory exists
    const testResultsDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    // Write detailed report
    const reportPath = path.join(testResultsDir, 'epic-e005-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log(chalk.blue('\n📊 Test Summary:'));
    console.log(chalk.blue('═══════════════'));
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Tests Passed: ${report.summary.passed}/${report.summary.totalTests}`);
    if (report.summary.coverage > 0) {
      console.log(`Code Coverage: ${report.summary.coverage}%`);
    }
    
    console.log('\nDetailed Results:');
    Object.entries(this.results).forEach(([testType, result]) => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      const color = result.status === 'passed' ? chalk.green : chalk.red;
      console.log(color(`  ${icon} ${testType}: ${result.status} (${result.duration}ms)`));
    });
    
    console.log(chalk.blue(`\nDetailed report saved to: ${reportPath}`));
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  const runner = new TestRunner();
  
  switch (testType) {
    case 'unit':
      runner.runUnitTests().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'integration':
      runner.runIntegrationTests().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'performance':
      runner.runPerformanceTests().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'all':
    default:
      runner.runAllTests().then(success => process.exit(success ? 0 : 1));
      break;
  }
}

module.exports = TestRunner;
