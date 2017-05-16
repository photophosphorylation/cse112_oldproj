var text = '';
module.exports = {
  'Step 1: Valid' : function (browser) {
    browser
      .url('http://cse112oldproj.herokuapp.com')
      //.url('localhost:3000')
      .waitForElementVisible('body', 1000)
      .useXpath()     // every selector now must be XPath
      .click("//a[text()='Log In']")
      .useCss()      // we're back to CSS now
      .waitForElementVisible('body',1000)
      .useXpath()
      .click("//a[text()='Register']")
      .useCss()
      .waitForElementVisible('body',1000)
      .useXpath()
      .click("/html/body/nav/div/div[1]/a")
      .useCss()
      .waitForElementVisible('body',1000)
      .end();
      /*.setValue('input[type=text]', 'Sample Name')
      .click('button[id=submit]' )
      .pause(1000)
      .getAlertText(function(result) {
          text = result.value;
          browser.assert.equal(true,text.includes('Contact successfully added'));
      })
      .pause(1000)
      .acceptAlert()
      .clearValue('input[type=text')
  },
  'Step 2: Not Valid': function (browser) {
    browser
      .setValue('input[type=text]', 'Sample12345')
      .click('button[id=submit]')
      .pause(1000)
      .getAlertText(function(result) {
          text = result.value;
          browser.assert.equal(true,text.includes('Contact Name cannot'));
      })
      .pause(1000)
      .acceptAlert()
      .clearValue('input[type=text')
  },
  'Step 3: Not Valid Length': function (browser) {
    browser
      .setValue('input[type=text]', 'Sample Name12345')
      .click('button[id=submit]')
      .pause(1000)
      .getAlertText(function(result) {
          text = result.value;
          browser.assert.equal(true,text.includes('Contact Name cannot'));
      })
      .pause(1000)
      .acceptAlert()
      .clearValue('input[type=text')
  },
  'Step 4: change format' : function(browser) {
    browser
      .click('button[id=change-format')
      .waitForElementVisible('input[name=inputChar]',1000)
      .waitForElementVisible('input[name=inputNum]',1000)
      .setValue('input[name=inputChar', 'h')
      .click('button[id=confirm-format]')
      .pause(1000)
      .getAlertText(function(result) {
        if (result) {
          text = result.value;
          console.log(result);
          browser.assert.equal(true,text.includes('Configuration saved succesfully'));
        }
        else {
          console.log('Something went wrong');
          browser.assert.equal(true,false)
        }
      })
      .acceptAlert()
      .pause(2000)
      .setValue('input[type=text]', 'hello')
      .click('button[id=submit]')
      .getAlertText(function(result) {
          text = result.value;
          browser.assert.equal(true,text.includes('Contact Name cannot'));
      })
      .acceptAlert()
      console.log('Changing back format to default')
      browser.click('button[id=change-format')
      .waitForElementVisible('input[name=inputChar]',1000)
      .waitForElementVisible('input[name=inputNum]',1000)
      .clearValue('input[name=inputChar')
      .click('button[id=confirm-format]')
      .acceptAlert()
      .end();
  */}
};