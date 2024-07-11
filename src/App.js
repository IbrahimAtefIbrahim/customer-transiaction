import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Form } from 'react-bootstrap';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    axios.get('https://customer-trnsction.vercel.app/api/data')
      .then(response =>
        { 
          setCustomers(response.data?.customers)
        });
    axios.get('https://customer-trnsction.vercel.app/api/data')
      .then(response => setTransactions(response.data?.transactions));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const filteredTransactions = transactions.filter(transaction =>
    customers.some(customer =>
      customer.id == transaction.customer_id &&
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(transaction.amount).includes(searchTerm)
    )
  );

  const transactionsByCustomer = selectedCustomer ? transactions.filter(transaction => transaction.customer_id == selectedCustomer.id) : [];

  const totalTransactionPerDay = transactionsByCustomer.reduce((acc, transaction) => {
    acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
    return acc;
  }, {});

  const chartData = Object.keys(totalTransactionPerDay).map(date => ({
    date,
    amount: totalTransactionPerDay[date]
  }));

  return (
    <Container>
      <Row>
        <Col>
          <h1>Customer Transactions</h1>
          <Form.Group controlId="search">
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by customer name or transaction amount"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Transaction Date</th>
                <th>Transaction Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => {
                const customer = customers.find(c => c.id === transaction.customer_id);
                return (
                  <tr key={transaction.id} onClick={() => handleCustomerSelect(customer)}>
                    <td>{customer ? customer.name : 'Unknown'}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          {selectedCustomer && (
            <div>
              <h2>Transaction Graph for {selectedCustomer.name}</h2>
              <LineChart width={600} height={300} data={chartData}>
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
              </LineChart>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default App;