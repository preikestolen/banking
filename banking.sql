-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Apr 26, 2023 at 03:55 PM
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
  `btc` int(11) NOT NULL,
  `eth` int(11) NOT NULL,
  `usd` int(11) NOT NULL,
  `trl` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`accountid`, `customerid`, `username`, `btc`, `eth`, `usd`, `trl`) VALUES
(7, 42, 'ali', 10, 10, 1000, 1000),
(8, 43, 'ece', 10, 10, 1000, 1000),
(9, 44, 'cem', 10, 10, 1000, 1000);

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
-- Table structure for table `transfer`
--

CREATE TABLE `transfer` (
  `txID` int(11) NOT NULL,
  `fromID` int(11) NOT NULL,
  `toID` int(11) NOT NULL,
  `txCurrency` varchar(200) NOT NULL,
  `txAmount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `transfer`
--

INSERT INTO `transfer` (`txID`, `fromID`, `toID`, `txCurrency`, `txAmount`) VALUES
(1, 8, 7, 'btc', 2),
(2, 7, 8, 'btc', 2),
(3, 8, 7, 'usd', 100),
(4, 7, 8, 'usd', 100),
(5, 8, 9, 'btc', 2),
(6, 8, 7, 'btc', 5),
(7, 7, 8, 'btc', 5),
(8, 9, 8, 'btc', 2),
(9, 8, 7, 'btc', 2),
(10, 7, 8, 'btc', 2),
(11, 8, 7, 'btc', 1),
(12, 7, 8, 'btc', 11),
(13, 8, 7, 'btc', 10),
(14, 8, 7, 'btc', 10),
(15, 7, 8, 'btc', 10),
(16, 7, 8, 'btc', 2),
(17, 8, 7, 'btc', 2),
(18, 8, 9, 'btc', 1),
(19, 9, 8, 'btc', 1),
(20, 7, 9, 'usd', 500),
(23, 9, 7, 'usd', 500),
(24, 7, 9, 'btc', 1),
(25, 9, 7, 'btc', 1);

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
  MODIFY `customerid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `transfer`
--
ALTER TABLE `transfer`
  MODIFY `txID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `customer-cons` FOREIGN KEY (`customerid`) REFERENCES `customer` (`customerid`) ON DELETE CASCADE ON UPDATE CASCADE;

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
