import React, { Component } from 'react';
import Contract from 'truffle-contract';
import {
  Container,
  Grid,
  Row,
  Col,
  Button,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  ControlLabel
} from 'rsuite';

import './index.css';
import MetaCoinArtifact from '../build/contracts/MetaCoin.json';
import web3, { fixTruffleContractCompatibilityIssue, getCurrentProvider } from '../web3';

class MainView extends Component {
  constructor(props) {
    super(props);

    // Initialize contract instance and set its provider
    let metaCoinInstance = Contract(MetaCoinArtifact);
    metaCoinInstance.setProvider(getCurrentProvider());
    metaCoinInstance = fixTruffleContractCompatibilityIssue(metaCoinInstance);

    this.state = {
      accounts: [],
      formValue: {
        sendAmount: '',
        sendTo: ''
      },
      blockNumber: web3.eth.blockNumber,
      metaCoinInstance
    };
  }

  componentDidMount = () => {
    this.getAccountBalances();

    web3.eth.getBlockNumber().then(block => {
      this.setState({ blockNumber: block });
    });
  };

  onSendBalance = e => {
    e.preventDefault();
    const { sendAmount, sendTo } = this.state.formValue;
    const address = this.state.accounts[0].account;
    this.sendCoin(address, sendTo, sendAmount);
    this.setState({
      formValue: {
        sendAmount: '',
        sendTo: ''
      }
    });
  };

  getAccountBalance = account =>
    this.state.metaCoinInstance
      .deployed()
      .then(metaCoin => metaCoin.getBalance.call(account, { from: account }))
      .then(value => value.valueOf())
      .catch(e => {
        console.log(e);
        throw e;
      });

  getAccountBalances = async () => {
    await web3.eth.getAccounts((error, accounts) => {
      if (error !== null) {
        console.error(error);
        return;
      }

      accounts.map(acc => {
        const blnc = this.getAccountBalance(acc);
        blnc.then(data =>
          this.setState({
            accounts: [...this.state.accounts, { account: acc, balance: data }]
          })
        );
      });
    });
  };

  sendCoin = (sender, receiver, amount) =>
    this.state.metaCoinInstance
      .deployed()
      .then(metaCoin => metaCoin.sendCoin(receiver, amount, { from: sender }))
      .then(value => value.valueOf())
      .catch(e => {
        console.log(e);
        throw e;
      });

  handleChange = value => {
    this.setState({
      formValue: value
    });
  };

  render() {
    console.log(this.state.formValue);
    return (
      <Container>
        <Grid>
          <header className="header">
            <h1 className="title">SIKKA</h1>
          </header>
          <Row>
            <Col xs={12}>
              <section>
                <b>Current block:</b> <span>{this.state.blockNumber}</span>
                {this.state.accounts.length > 0 && (
                  <div>
                    {this.state.accounts.map(account => (
                      <div className="account" key={account.account}>
                        <p>
                          <b>Address:</b> <span>{account.account}</span>
                          <br />
                          <b>Balance:</b> <span>{account.balance} SIK</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Col>
            <Col xs={12}>
              <section className="form-section">
                <Form onChange={this.handleChange} formValue={this.state.formValue}>
                  <FormGroup>
                    <ControlLabel>Amount</ControlLabel>
                    <FormControl type="text" name="sendAmount" placeholder="e.g. 95" />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Receiver Address</ControlLabel>
                    <FormControl
                      type="text"
                      name="sendTo"
                      placeholder="e.g., 0x93e66d9baea28c17d9fc393b53e3fbdd76899dae"
                    />
                    <HelpBlock tooltip>Required</HelpBlock>
                  </FormGroup>
                  <FormGroup>
                    <Button color="violet" type="submit" onClick={this.onSendBalance}>
                      Submit
                    </Button>
                  </FormGroup>
                </Form>
              </section>
            </Col>
          </Row>
        </Grid>
      </Container>
    );
  }
}

export default MainView;
