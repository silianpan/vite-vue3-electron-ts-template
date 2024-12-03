<!--
  * 省略号组件
  * Created by liupan
  * Created at 2023-12-29 17:43
-->
<script lang="tsx">
import { cutStrByFullLength, getStrFullLength } from './util.js';
/*
    const isSupportLineClamp = document.body.style.webkitLineClamp !== undefined;

    const TooltipOverlayStyle = {
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
    };
  */

export default {
  name: 'Ellipsis',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-ellipsis'
    },
    tooltip: {
      type: Boolean,
      default: true
    },
    length: {
      type: Number,
      required: true
    },
    lines: {
      type: Number,
      default: 1
    },
    fullWidthRecognition: {
      type: Boolean,
      default: false
    },
    effect: {
      type: String,
      default: 'light'
    }
  },
  setup(props, { slots }) {
    function getStrDom(str, fullLength) {
      return (
        <span>
          {cutStrByFullLength(str, this.length) +
            (fullLength > this.length ? '...' : '')}
        </span>
      );
    }
    function getTooltip(fullStr, fullLength) {
      return (
        <el-tooltip
          effect={props.effect}
          v-slots={{
            content: () => fullStr,
            default: () => this.getStrDom(fullStr, fullLength)
          }}
        />
      );
    }
    function renderComp() {
      const { tooltip, length } = props;
      if (slots) {
        const str = slots
          .default?.()
          .map(vNode => vNode.children)
          .join('');
        const fullLength = getStrFullLength(str);
        const strDom =
          tooltip && fullLength > length
            ? this.getTooltip(str, fullLength)
            : this.getStrDom(str, fullLength);
        return strDom;
      } else {
        return null;
      }
    }
    return {
      getTooltip,
      getStrDom,
      renderComp
    };
  },
  render() {
    return this.renderComp();
  }
};
</script>
