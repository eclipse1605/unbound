// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Content {
    struct Spark {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
    }

    Spark[] public sparks;
    uint256 public sparkCount;   
    event SparkCreated(
        uint256 indexed id,
        address indexed author,
        string content,
        uint256 timestamp
    );

    function createSpark(string memory _content) public {
        sparkCount++;
        sparks.push(Spark({
            id: sparkCount,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        }));
        emit SparkCreated(sparkCount, msg.sender, _content, block.timestamp);
    }

    function getSpark(uint256 _id) public view returns (Spark memory){
        require(_id > 0 && _id <= sparkCount, "Invalid Spark ID");
        return sparks[_id - 1];
    }

    function getAllSparks() public view returns (Spark[] memory){
        return sparks;
    }
}
