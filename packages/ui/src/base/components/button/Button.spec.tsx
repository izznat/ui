import { Button } from "./Button";

<Button />;
<Button type="submit" form="form-id" name="action" />;

<Button nativeButton={false} render={(props) => <div {...props} />} />;
<Button nativeButton={false} disabled render={(props) => <span {...props} />} />;

<Button nativeButton={false} type="submit" />;
