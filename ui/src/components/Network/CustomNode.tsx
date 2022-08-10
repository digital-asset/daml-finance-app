import { memo } from "react";
import { NodeProps } from "react-flow-renderer";

const CustomNode = ({ data }: NodeProps) => {
  return (
    <>
      {data?.label}
    </>
  );
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);