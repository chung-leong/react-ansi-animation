import { useState, useRef, useEffect, createElement } from 'react';
import { Text, Box, useInput } from 'ink';

export default function MulticolumnSelectInput(props) {
  const { 
    items = [],
    initialIndex = 0,
    isFocused = true,
    limit = 24,
    columnCount = 4,
    width = '100%',
    indicatorComponent = Indicator,
    itemComponent = Item,    
    onSelect,
    onHighlight,
  } = props;
  const [ selectedIndex, setSelectedIndex ] = useState(initialIndex);
  const [ columnOffset, setColumnOffset ] = useState(calculateColumnOffset(selectedIndex, columnCount, limit));
  useInput((input, key) => {
    let newIndex = -1;
    if (input === 'k' || key.upArrow) {
      newIndex = selectedIndex - 1;
    } else if (input === 'j' || key.downArrow) {
      newIndex = selectedIndex + 1;
    } else if (input === 'h' || key.leftArrow) {
      newIndex = selectedIndex - limit;
    } else if (input === 'l' || key.rightArrow) {
      newIndex = selectedIndex + limit;
      if (newIndex >= items.length) {
        // jump to the last item only if we're in the second to last column
        const currentColumn = Math.floor((selectedIndex + 1) / limit);
        const lastColumn = Math.floor(items.length / limit);
        if (lastColumn > currentColumn) {
          newIndex = items.length - 1;
        }
      }
    } else if (input === '^' || input === '\u005BH') {
      newIndex = 0;
    } else if (input === '$' || input === '\u005BF') {
      newIndex = items.length - 1;
    } else if (key.return) {
      if (items[selectedIndex]) {
        onSelect?.(items[selectedIndex]);
      }
    }   
    if (newIndex >= 0 && newIndex < items.length) {
      setSelectedIndex(newIndex);
      // adjust column offset so the selected item is in view
      setColumnOffset(calculateColumnOffset(initialIndex, columnCount, limit, columnOffset));
      onHighlight?.(items[newIndex]);
    }
  }, { isActive: isFocused });
  // reset selectIndex when items are different 
	const previousItems = useRef();
  useEffect(() => {
    const { current } = previousItems;
    if (current && items.some((item, i) => item.value !== current[i].value)) {
      setSelectedIndex(initialIndex);
      setColumnOffset(calculateColumnOffset(initialIndex, columnCount, limit));
    }
    previousItems.current = items;
  }, [ items, initialIndex, columnCount, limit ]);
  const columns = [];
  for (let i = 0; i < columnCount; i++) {    
    const rows = [];
    for (let j = 0, index = (columnOffset + i) * limit; j < limit && index < items.length; j++, index++) {
      const isSelected = (index === selectedIndex);
      const indicator = createElement(indicatorComponent, { isSelected });
      const item = createElement(itemComponent, { ...items[index], isSelected });
      const row = createElement(Box, { key: index }, indicator, item);
      rows.push(row);
    }
    // use flex basis 0 so columns have the same width
    const column = createElement(Box, { key: i, flexDirection: 'column', flexGrow: 1, flexBasis: 0 }, rows);
    columns.push(column);
  }
  return createElement(Box, { width }, columns);
}

function calculateColumnOffset(index, count, limit, offset = 0) {
  const columnIndex = Math.floor(Math.max(1, index + 1) / limit);
  let newOffset = offset;
  while (newOffset + count <= columnIndex) {
    newOffset++;
  }
  while (newOffset > columnIndex) {
    newOffset--;
  }
  return newOffset;
}



function Item({ isSelected = false, label }) {
	return createElement(Text, { inverse: isSelected }, ` ${label} `);
}

function Indicator({ isSelected }) {
  return null;
}