import { formAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';
import type { StyleFunctionProps } from '@chakra-ui/theme-tools';
import { getColor } from '@chakra-ui/theme-tools';

import getDefaultFormColors from '../utils/getDefaultFormColors';
import FancySelect from './FancySelect';
import FormLabel from './FormLabel';
import Input from './Input';
import Textarea from './Textarea';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

function getFloatingVariantStylesForSize(size: 'md' | 'lg', props: StyleFunctionProps) {
  const { theme } = props;
  const { focusPlaceholderColor, errorColor } = getDefaultFormColors(props);

  const activeLabelStyles = {
    ...FormLabel.variants?.floating?.(props)._focusWithin,
    ...FormLabel.sizes?.[size](props)._focusWithin,
  } || {};

  const activeInputStyles = (() => {
    switch (size) {
      case 'md': {
        return {
          paddingTop: '26px',
          paddingBottom: '10px',
        };
      }

      case 'lg': {
        return {
          paddingTop: '38px',
          paddingBottom: '18px',
        };
      }
    }
  })();

  const inputPx = (() => {
    switch (size) {
      case 'md': {
        return '16px';
      }

      case 'lg': {
        return '24px';
      }
    }
  })();

  return {
    container: {
      // active styles
      _focusWithin: {
        label: activeLabelStyles,
        'input, textarea': activeInputStyles,
      },

      // label styles
      label: FormLabel.sizes?.[size](props) || {},
      'input:not(:placeholder-shown) + label, textarea:not(:placeholder-shown) + label': activeLabelStyles,
      'input[aria-invalid=true] + label, textarea[aria-invalid=true] + label': {
        color: getColor(theme, errorColor),
      },

      // input styles
      input: Input.sizes?.[size].field,
      'input[aria-autocomplete=list]': FancySelect.sizes[size].field,
      textarea: Textarea.sizes?.[size],
      'input, textarea': {
        padding: inputPx,
      },
      'input:not(:placeholder-shown), textarea:not(:placeholder-shown)': activeInputStyles,
      'input[disabled] + label, textarea[disabled] + label': {
        backgroundColor: 'transparent',
      },

      // indicator styles
      'input:not(:placeholder-shown) + label .chakra-form__required-indicator, textarea:not(:placeholder-shown) + label .chakra-form__required-indicator': {
        color: getColor(theme, focusPlaceholderColor),
      },
      'input[aria-invalid=true] + label .chakra-form__required-indicator, textarea[aria-invalid=true] + label .chakra-form__required-indicator': {
        color: getColor(theme, errorColor),
      },
    },
  };
}

const baseStyle = definePartsStyle(() => {
  return {
    requiredIndicator: {
      marginStart: 0,
      color: 'gray.500',
    },
  };
});

const variantFloating = definePartsStyle((props) => {
  return {
    container: {
      label: FormLabel.variants?.floating(props) || {},
    },
  };
});

const sizes = {
  lg: definePartsStyle((props) => {
    if (props.variant === 'floating') {
      return getFloatingVariantStylesForSize('lg', props);
    }

    return {};
  }),
  md: definePartsStyle((props) => {
    if (props.variant === 'floating') {
      return getFloatingVariantStylesForSize('md', props);
    }

    return {};
  }),
};

const variants = {
  floating: variantFloating,
};

const Form = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: 'md',
  },
});

export default Form;
