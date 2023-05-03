-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: May 03, 2023 at 08:25 AM
-- Server version: 5.7.39
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `banking`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `accountid` int(11) NOT NULL,
  `customerid` int(11) NOT NULL,
  `username` varchar(200) NOT NULL,
  `btc` float(10,4) NOT NULL,
  `eth` float(10,4) NOT NULL,
  `usd` float(10,4) NOT NULL,
  `trl` float(10,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`accountid`, `customerid`, `username`, `btc`, `eth`, `usd`, `trl`) VALUES
(7, 42, 'ali', 9.5200, 11.2500, 13000.0000, 1461.3254),
(8, 43, 'ece', 9.6999, 10.2515, 1000.5000, 99900.1875),
(9, 44, 'cem', 10.0017, 10.0000, 992.6745, 925.6045);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customerid` int(11) NOT NULL,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `fullname` varchar(200) NOT NULL,
  `country` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customerid`, `username`, `password`, `fullname`, `country`) VALUES
(42, 'ali', 'ali', 'Ali Kaya', 'tr'),
(43, 'ece', 'ece', 'Ece Demir', 'tr'),
(44, 'cem', 'cem', 'Cem Yılmaz', 'tr');

-- --------------------------------------------------------

--
-- Table structure for table `exchange`
--

CREATE TABLE `exchange` (
  `exID` int(11) NOT NULL,
  `accountID` int(11) NOT NULL,
  `fromCurrency` varchar(200) NOT NULL,
  `fromAmount` float(10,4) NOT NULL,
  `toCurrency` varchar(200) NOT NULL,
  `toAmount` float(10,4) NOT NULL,
  `exRate` float(10,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `exchange`
--

INSERT INTO `exchange` (`exID`, `accountID`, `fromCurrency`, `fromAmount`, `toCurrency`, `toAmount`, `exRate`) VALUES
(1, 8, 'trl', 10.0000, 'usd', 0.5000, 0.050000),
(2, 7, 'usd', 500.0000, 'btc', 0.0200, 0.000040),
(3, 7, 'btc', 0.5000, 'usd', 12500.0000, 25000.000000),
(4, 9, 'usd', 12.5000, 'trl', 250.0000, 20.000000),
(5, 8, 'btc', 0.3000, 'trl', 150000.0000, 500000.000000),
(6, 8, 'btc', 0.0001, 'eth', 0.0015, 15.400000),
(7, 9, 'trl', 800.0000, 'btc', 0.0016, 0.000002),
(8, 9, 'trl', 90.9900, 'usd', 4.5495, 0.050000),
(9, 9, 'trl', 50.4000, 'btc', 0.0001, 0.000002),
(10, 9, 'trl', 12.5000, 'usd', 0.6250, 0.050000),
(11, 8, 'trl', 50000.0000, 'eth', 1.5000, 0.000030);

-- --------------------------------------------------------

--
-- Table structure for table `transfer`
--

CREATE TABLE `transfer` (
  `txID` int(11) NOT NULL,
  `fromID` int(11) NOT NULL,
  `toID` int(11) NOT NULL,
  `txCurrency` varchar(200) NOT NULL,
  `txAmount` float(10,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `transfer`
--

INSERT INTO `transfer` (`txID`, `fromID`, `toID`, `txCurrency`, `txAmount`) VALUES
(1, 8, 7, 'btc', 2.0000),
(2, 7, 8, 'btc', 2.0000),
(3, 8, 7, 'usd', 100.0000),
(4, 7, 8, 'usd', 100.0000),
(5, 8, 9, 'btc', 2.0000),
(6, 8, 7, 'btc', 5.0000),
(7, 7, 8, 'btc', 5.0000),
(8, 9, 8, 'btc', 2.0000),
(9, 8, 7, 'btc', 2.0000),
(10, 7, 8, 'btc', 2.0000),
(11, 8, 7, 'btc', 1.0000),
(12, 7, 8, 'btc', 11.0000),
(13, 8, 7, 'btc', 10.0000),
(14, 8, 7, 'btc', 10.0000),
(15, 7, 8, 'btc', 10.0000),
(16, 7, 8, 'btc', 2.0000),
(17, 8, 7, 'btc', 2.0000),
(18, 8, 9, 'btc', 1.0000),
(19, 9, 8, 'btc', 1.0000),
(20, 7, 9, 'usd', 500.0000),
(23, 9, 7, 'usd', 500.0000),
(24, 7, 9, 'btc', 1.0000),
(25, 9, 7, 'btc', 1.0000),
(26, 8, 7, 'btc', 1.0000),
(27, 8, 9, 'btc', 0.5000),
(28, 9, 8, 'btc', 0.5000),
(29, 9, 7, 'usd', 100.0000),
(30, 7, 9, 'usd', 100.0000),
(31, 8, 7, 'btc', 0.2000),
(32, 8, 7, 'btc', 0.1000),
(33, 7, 8, 'btc', 0.3000),
(34, 7, 8, 'trl', 100.0000),
(35, 8, 7, 'trl', 100.0000),
(36, 9, 8, 'trl', 125.7800),
(37, 8, 9, 'trl', 125.7800),
(38, 8, 9, 'trl', 350.7500),
(39, 8, 9, 'trl', 101.8000),
(40, 8, 7, 'trl', 40.2500),
(41, 8, 7, 'eth', 1.2500),
(42, 8, 9, 'trl', 500.6700),
(43, 8, 9, 'trl', 1.1000),
(44, 9, 7, 'trl', 120.4500),
(45, 9, 7, 'trl', 83.8500),
(46, 8, 7, 'trl', 95.8200),
(47, 9, 7, 'trl', 120.5055);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`accountid`),
  ADD KEY `customer-cons` (`customerid`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customerid`,`username`);

--
-- Indexes for table `exchange`
--
ALTER TABLE `exchange`
  ADD PRIMARY KEY (`exID`),
  ADD KEY `accountID` (`accountID`);

--
-- Indexes for table `transfer`
--
ALTER TABLE `transfer`
  ADD PRIMARY KEY (`txID`),
  ADD KEY `fromID` (`fromID`),
  ADD KEY `toID` (`toID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `accountid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customerid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `exchange`
--
ALTER TABLE `exchange`
  MODIFY `exID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `transfer`
--
ALTER TABLE `transfer`
  MODIFY `txID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `customer-cons` FOREIGN KEY (`customerid`) REFERENCES `customer` (`customerid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exchange`
--
ALTER TABLE `exchange`
  ADD CONSTRAINT `exchange_ibfk_1` FOREIGN KEY (`accountID`) REFERENCES `account` (`accountid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transfer`
--
ALTER TABLE `transfer`
  ADD CONSTRAINT `transfer_ibfk_1` FOREIGN KEY (`fromID`) REFERENCES `account` (`accountid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transfer_ibfk_2` FOREIGN KEY (`toID`) REFERENCES `account` (`accountid`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
