/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaHexColorFieldProps} from '@react-types/color';
import {Color, HexColorFieldState} from '@react-stately/color';
import {HTMLAttributes, LabelHTMLAttributes, RefObject} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {useSpinButton} from '@react-aria/spinbutton';
import {useTextField} from '@react-aria/textfield';

interface HexColorFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputFieldProps: HTMLAttributes<HTMLInputElement>
}

export function useHexColorField(
  props: AriaHexColorFieldProps,
  state: HexColorFieldState,
  ref: RefObject<HTMLInputElement>
): HexColorFieldAria {
  const {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    value,        
    defaultValue,
    onChange,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    ...otherProps
  } = props;

  const {
    isDisabled,
    isReadOnly,
    isRequired,
    minValue = '#000000',
    maxValue = '#ffffff'
  } = otherProps;
  
  const {
    colorValue,
    setColorValue,
    inputValue,
    setInputValue,
    commitInputValue,
    increment,
    decrement,
    incrementToMax,
    decrementToMin
  } = state;

  const minColorInt = Color.parse(minValue).toHexInt();
  const maxColorInt = Color.parse(maxValue).toHexInt();

  const {spinButtonProps} = useSpinButton(
    {
      isDisabled,
      isReadOnly,
      isRequired,
      maxValue: minColorInt,
      minValue: maxColorInt,
      onIncrement: increment,
      onIncrementToMax: incrementToMax,
      onDecrement: decrement,
      onDecrementToMin: decrementToMin,
      value: colorValue ? colorValue.toHexInt() : minColorInt,
      textValue: inputValue
    }
  );

  const onInputChange = (value: string) => {
    setInputValue(value);
    value = value.trim();
    if (!value.length) { return; }
    if (!value.startsWith('#')) {
      value = `#${value}`;
    }
    try {
      setColorValue(Color.parse(value));
    } catch (err) {
      // ignore
    }
  };

  const onBlur = (e) => {
    spinButtonProps.onBlur(e);
    commitInputValue();
  };

  const inputId = useId();
  let {labelProps, inputProps} = useTextField(
    mergeProps(otherProps, {
      id: inputId,
      value: inputValue,
      type: 'text',
      autoComplete: 'off',
      onChange: onInputChange
    }), ref);

  return {
    labelProps,
    inputFieldProps: mergeProps(inputProps, {
      onKeyDown: spinButtonProps.onKeyDown,
      onFocus: spinButtonProps.onFocus,
      onBlur
    })
  };
}