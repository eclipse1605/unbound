
export function formatAddress(address) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export const formatDate = (timestamp) => {
  if (!timestamp) return 'No date';
  
  try {
    
    let date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      
      date = timestamp < 10000000000 
        ? new Date(timestamp * 1000)  
        : new Date(timestamp);        
    } else if (typeof timestamp === 'string') {
      
      const num = Number(timestamp);
      if (!isNaN(num)) {
        date = num < 10000000000 
          ? new Date(num * 1000)  
          : new Date(num);        
      } else {
        date = new Date(timestamp);
      }
    } else {
      
      console.warn('Unexpected timestamp format:', timestamp);
      date = new Date();
    }

    if (isNaN(date.getTime())) {
      console.warn('Invalid date from timestamp:', timestamp);
      return 'Invalid date';
    }

    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, timestamp);
    return 'Invalid date';
  }
} 